/* #############################################################################
 *                           require-statements
 * ###########################################################################*/
//global require
const configIni  = require('config.ini');
const express    = require('express');
const request    = require('request');

//local require
const core       = require('./core.js');

/* #############################################################################
 *                                variables
 * ###########################################################################*/

// init app and config constants
const config = configIni.load('config.ini');
const app = express();

// disable rejection if unauthorized host TODO: find a better solution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/* #############################################################################
 *                                openid variables
 * ###########################################################################*/

// initialze gluuIssuer for client initialization
const gluuIssuer = core.initIssuer;
console.log('Set up issuer: %s', gluuIssuer.issuer);

// client initialization
const client = new gluuIssuer.Client({
  client_id: config.init.clientServerId,
  client_secret: config.init.clientServerSecret
}); // => Client
console.log('Set up client: %s', client.client_id);

// accesstoken
var tokenS;
// userinfo from specific token
var info;
// resource id from 1 set TODO: can be multiple ids in the future
var resourceId;
// resourceInfo from specific resourceID, needed for permission registration
var permissionBody = {};
// umaTicket for umaToken Request
var umaTicket;
// rpt token for authorization process
var rpt;
// scopes from checkboxes

/* #############################################################################
 *                               openid routing
 * ###########################################################################*/

 // to initiate a new openid process
app.get('/login', (req, res) => {
  res.send(core.auth(client, config.init.clientServerAddress));
});

app.get('/callback', (request, res) => {
  const state = "1234";
  const nonce = "1234";
  client.authorizationCallback(config.init.clientServerAddress+ '/callback',
  request.query, {state, nonce})
  .then(function (tokenSet) {
    console.log("Login performed correctly, received TokenSet");
    tokenS = tokenSet;
    res.send(tokenS);
  });
});

// retrieve user relevant information (definded in scopes)
app.get('/userInfo', (request, res) => {
  if (tokenS) {
    client.userinfo(tokenS)// => Promise
    .then(function (userinfo) {
      console.log("AccessToken available, sending User Information");
      info = userinfo;
      res.send(info);
      res.end();
    });
  } else {
    res.send("No AccessToken available, " +
    "please start authorization process with /login.");
  }
});

/* #############################################################################
 *                             uma routing
 * ###########################################################################*/

// uma token endpoint to request a requesting party token (RPT) and
// a persisted claims token (PCT)
app.get('/umaToken', (req, res) => {
  if(umaTicket){
    client.getUmaToken(umaTicket)
    .then(function (umaTokenSet) {
      if(typeof umaTokenSet.response !== 'undefined') {
        if (umaTokenSet.response.statusCode == 403) {
          console.log('Need Info, redirect to Claim Endpoint');
          var parsedBody = JSON.parse(umaTokenSet.response.body);
          var url = claimsUrl(parsedBody.redirect_user);
          res.redirect(url);
        }
      } else if (typeof JSON.parse(umaTokenSet) !== 'undefined'){
        console.log("UMA-TokenSet received (RPT and PCT)");
        umaTokenSet = JSON.parse(umaTokenSet)
        res.setHeader('Content-Type', 'application/json');
        res.send(umaTokenSet);
        rpt = (umaTokenSet).access_token;
      }

    });
  } else {
      console.log("No UmaTicket available!");
  }
});

// permission endpoint to request permission ticket with correct resource id
// and corresponding resource scopes
app.get('/permission', (req, res) => {
  if (tokenS && permissionBody) {
    client.permission(tokenS.access_token, permissionBody)
    .then(function (ticket) {
      console.log("Request correct, received UMA Ticket");
      umaTicket = JSON.parse(ticket).ticket;
      res.send(ticket);
    });
  } else {
    res.send("No AccessToken/ResourceInfo available," +
    " please start authorization process with /login.");
  }
});

// requests resource server for the hearth rate (with and without rpt)
app.get('/getHearthRate', (req, res) => {
  //with rpt the response should be the hearth rate data
  if (rpt) {
    const options = {
        url: config.init.resourceServerAddress + '/hearthRate',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + rpt
        }
    };
      request(options, (err, response, body) => {
        if (err) throw err;
        core.saveToFile('hearthRate.txt', body);
        res.send("Saved file!");
        console.log('Request accepted, data received');
      });
  // without rpt the uma process is initiated and the client need to
  // proceed with the uma-workflow
  } else {
    const options = {
        url: config.init.resourceServerAddress + '/hearthRate',
        method: 'GET',
    };
      request(options, (err, response, body) => {
        if (err) throw err;
        if (response.statusCode != 500) {
          umaTicket = JSON.parse(body).ticket;
          console.log("Received UMA-Ticket to request RPT");
          res.send("Received UMA-Ticket to request RPT");
        } else {
          console.log(body);
          res.send(body);
        }
      });
  }
});

// callback uri for the gluu auth server after claims gathering
app.get('/claimCallback', (req, res) => {
  if (req.query.ticket) {
    res.send(req.query.ticket);
    umaTicket = req.query.ticket;
  }
});

// function to add needed query parameters for correct claim gathering request
var claimsUrl = (redirectUser) => redirectUser +
"&claims_redirect_uri=http://localhost:3000/claimCallback";

/* #############################################################################
 *                                server
 * ###########################################################################*/

// initialze the server-api with specified port
app.listen(config.init.clientServerPort, () => {
  console.log('Listen on port ' + config.init.clientServerPort);
});
