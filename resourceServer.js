/* #############################################################################
 *                           require-statements
 * ###########################################################################*/
const configIni  = require('config.ini');
const { Issuer } = require('openid-client');
const bodyParser = require("body-parser");
const express    = require('express');
const request    = require('request');
const fs         = require('fs');

const core       = require('./core.js');

/* #############################################################################
 *                                variables
 * ###########################################################################*/

// init app and config constants
const config = configIni.load('config.ini');
const app = express();

// initialze bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// disable rejection if unauthorized host TODO: find a better solution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/* #############################################################################
 *                                openid variables
 * ###########################################################################*/
const gluuIssuer = core.getIssuer;
console.log('Set up issuer %s', gluuIssuer.issuer);

// create client with given id and secret
const client = new gluuIssuer.Client({
    client_id: config.init.resourceServerId,
    client_secret: config.init.resourceServerSecret
}); // => C
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
 // to initiate a new openid process
 // http://localhost:3000/login
 app.get('/login', function (req, res) {
   res.send(core.auth(client, config.init.resourceServerAddress));
 });

 // callback endpoint (comming back from login with accesstoken)
 app.get('/callback', function(req, res) {
   const state = "1234";
   const nonce = "1234";
   client.authorizationCallback(config.init.resourceServerAddress + '/callback',
   req.query, {state, nonce})
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
 // endpoint to request resource sets information
 app.get('/resource_sets', function(req, res) {
   if(tokenS.access_token){
     client.resource_set(tokenS.access_token)
     .then(function (resp) {
       resourceId = resp.replace(/\"|\[|\]/g, '');
       console.log("Available Resources with Resource_ID: " + resourceId);
       res.setHeader('Content-Type', 'text/html');
       res.send(core.resourceHtml(config.init.resourceServerAddress + '/resource_sets/'
       + resourceId, resourceId));
     });
   } else {
       console.log("No AccessToken available!");
   }
 });

 // id as query param in following path specification
 var id;
 app.param(['id'], function (req, res, next, value) {
   id = value;
   next();
 });

 // endpoint to request resource set information
 app.get('/resource_sets/:id', function(req, res) {
   if(tokenS.access_token && id) {
     client.resource_set(tokenS.access_token, id)
     .then(function (resourceInfo) {
       res.setHeader('Content-Type', 'application/json');
       res.send(resourceInfo);
       resourceInfo = JSON.parse(resourceInfo);
       permissionBody.resource_id = resourceInfo["_id"];
       permissionBody.resource_scopes = resourceInfo["resource_scopes"];
       console.log("Successfully received information about Resource with ResourceID: " + id);
     });
   } else {
     console.log("No ResourceId or AccessToken available!");
   }
 });

 // uma token endpoint to request a requesting party token (RPT) and
 // a persisted claims token (PCT)
 app.get('/umaToken', function(req, res) {
   if(umaTicket){
     client.getUmaToken(umaTicket)
     .then(function (umaTokenSet) {
       res.setHeader('Content-Type', 'application/json');
       res.send(umaTokenSet);
       rpt = (umaTokenSet).access_token;
     });
   } else {
       console.log("No UmaTicket available!");
   }
 });

 app.get('/rpt', function(req, res) {
   if (tokenS && rpt) {
     client.introspectUMA(tokenS, rpt)
     .then(function (status) {
       res.setHeader('Content-Type', 'application/json');
       res.send(status);
     });
   } else {
     console.log("No AccessToken or RPT available!");
   }
 });

 app.get('/resourceRegistration', function(req, res) {
   if(tokenS) {
     var resource = fs.readFileSync('resource.json', 'utf8');
     client.registerResource(tokenS, resource)
     .then(function (status) {
       res.setHeader('Content-Type', 'application/json');
       res.send(status);
       status = JSON.parse(status);
       resourceId = status._id;
       permissionBody.resource_id = status._id;
       permissionBody.resource_scopes = [ 'hearthRate' ];
       console.log(permissionBody);
     })
   } else {
       console.log("No AccessToken available!");
   }
 });

 //TODO: UNDER CONSTRUCTION!! http delete does not work in client JS
 app.get('/resourceDeletion', function(req, res) {
   if(tokenS) {
     client.deleteResource(tokenS, resourceId)
     .then(function (status) {
       res.setHeader('Content-Type', 'application/json');
       res.send(status);
       status = JSON.parse(status);
     })
   } else {
     console.log("No AccessToken available!");
   }
 });

 // get hearthrate from file
 app.get('/hearthRate', function(req, res) {
   if (tokenS) {
     var authHeader = req.headers.authorization;
     if (authHeader == null) {
       if (permissionBody) {
         client.permission(tokenS.access_token, permissionBody)
         .then(function (ticket) {
           console.log("Sending UMA-Ticket to Client");
           umaTicket = JSON.parse(ticket);
           res.status(401);
           res.setHeader('WWW-Authenticate', 'UMA realm=' + config.init.umaRealm);
           var uri = { as_uri: config.init.gluuServerAddess }
           var data = Object.assign(umaTicket, uri)
           res.send(data);
           res.end();
         });
       } else {
           console.log("No Resource Information available!");
       }
     } else {
       var rpt = authHeader.replace('Bearer ', '');
       client.introspectUMA(tokenS, rpt).then(function(body) {
         body = JSON.parse(body);
         active = body.active;
         if(active) {
           console.log("RPT is active, proceeding to check scopes");
           permissions = body.permissions[0];
           scope = permissions.resource_scopes[0];
           if(scope === "hearthRate") {
             console.log("Correct Scope found, sending requested data");
             var rate = fs.readFileSync('measurementData.txt', 'utf8');
             res.send(rate);
             res.end();
           } else {
             console.log("Invalid Scope / Not sufficent authorization");
           }
         } else {
           console.log("RPT is not active");
           res.send("inactive")
         }
       });

     }
   } else {
     console.log("No AccessToken available!");
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
       res.setHeader('Content-Type', 'application/json');
       res.json(ticket);
     });
   } else {
     res.send("No AccessToken / ResourceInformation available!");
   }
 });

 app.post('/measurementData', function(req, res) {
   var measurement = req.body.data;
   core.saveToFile('measurementData.txt', measurement);
   res.end();
 });

/* #############################################################################
 *                                server
 * ###########################################################################*/

app.listen(config.init.resourceServerPort, function () {
  console.log('Listen on port ' + config.init.resourceServerPort);
});
