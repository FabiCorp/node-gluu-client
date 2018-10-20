/* #############################################################################
 *                           require-statements
 * ###########################################################################*/
const configIni  = require('config.ini');
const { Issuer } = require('openid-client');
const express    = require('express');
const request    = require('request');

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
 
const gluuIssuer = core.getIssuer;
console.log('Set up issuer %s', gluuIssuer.issuer);


const client = new gluuIssuer.Client({
  client_id: config.init.clientServerId,
  client_secret: config.init.clientServerSecret
}); // => Client

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
var scopeQueries;
// create Issuer

/* #############################################################################
 *                               openid routing
 * ###########################################################################*/

app.get('/login', function (req, res) {
  ies = req.query["scopes"];
  res.send(core.auth(client, config.init.clientServerAddress));
});

app.get('/callback', function(request, res) {
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

app.get('/userInfo', function(request, res) {
  if (tokenS) {
    client.userinfo(tokenS)// => Promise
    .then(function (userinfo) {
      console.log("AccessToken available, sending User Information");
      info = userinfo;
      res.send(info);
      res.end();
    });
  } else {
    res.send("No AccessToken available, please start authorization process with /login.");
  }
});

/* #############################################################################
 *                             uma routing
 * ###########################################################################*/

// uma token endpoint to request a requesting party token (RPT) and
// a persisted claims token (PCT)
app.get('/umaToken', function(req, res) {
  if(umaTicket){
    client.getUmaToken(umaTicket)
    .then(function (umaTokenSet) {
      if(typeof umaTokenSet.response !== 'undefined') {
        if (umaTokenSet.response.statusCode == 403) {
          console.log('Need Info, redirect to Claim Endpoint');
          var parsedBody = JSON.parse(umaTokenSet.response.body);
          var url = claims(parsedBody.redirect_user);
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

app.get('/rpt', function(req, res) {
  if (tokenS && rpt) {
    client.introspectUMA(tokenS, rpt)
    .then(function (status) {
      console.log(status);
      res.setHeader('Content-Type', 'application/json');
      res.send(status);
    });
  } else {
    console.log("No AccessToken or RPT available!");
  }
});

// permission endpoint to request permission ticket with correct resource id
// and corresponding resource scopes
app.get('/permission', function(req, res) {
  if (tokenS && permissionBody) {
    client.permission(tokenS.access_token, permissionBody)
    .then(function (ticket) {
      console.log("Request correct, received UMA Ticket");
      umaTicket = JSON.parse(ticket).ticket;
      res.send(ticket);
    });
  } else {
    res.send("No AccessToken/ResourceInfo available, please start authorization process with /login.");
  }
});

app.get('/getHearthRate', function(req, response) {
  if (rpt) {
    const options = {
        url: config.init.resourceServerAddress + '/hearthRate',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + rpt
        }
    };
      request(options, function(err, res, body) {
        if (err) throw err;
        core.saveToFile('hearthRate.txt', body);
        response.send("Saved file!");
        console.log('Request accepted, data received');
      });
  } else {
    const options = {
        url: config.init.resourceServerAddress + '/hearthRate',
        method: 'GET',
    };
      request(options, function(err, res, body) {
        if (err) throw err;
        umaTicket = JSON.parse(body).ticket;
        console.log("Received UMA-Ticket to request RPT");
        console.log(umaTicket);
      });
      response.send("Received UMA-Ticket to request RPT")
  }
});

app.get('/claimCallback', function(req, res) {
  res.send(req.query.ticket);
  umaTicket = req.query.ticket;
});

var claims = (redirectUser) => redirectUser + "&claims_redirect_uri=http://localhost:3000/claimCallback";

/* #############################################################################
 *                                server
 * ###########################################################################*/

app.listen(config.init.clientServerPort, function () {
  console.log('Listen on port ' + config.init.clientServerPort);
});
