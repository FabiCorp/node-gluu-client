/* #############################################################################
 *                           require-statements
 * ###########################################################################*/

const express    = require('express');
const bodyParser = require("body-parser");
const Issuer     = require('openid-client').Issuer;
const fs         = require('fs');
const config     = require('./config.js');

/* #############################################################################
 *                                variables
 * ###########################################################################*/

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static(__dirname + '/spectral'));
// disable rejection if unauthorized host TODO: find a better solution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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

const gluuIssuer = new Issuer({
  issuer: config.gluuServerAddress,
  authorization_endpoint: config.gluuServerAddress + '/oxauth/restv1/authorize/',
  token_endpoint: config.gluuServerAddress + '/oxauth/restv1/token',
  userinfo_endpoint: config.gluuServerAddress + '/oxauth/restv1/userinfo',
  jwks_uri: config.gluuServerAddress + '/oxauth/restv1/jwks',
  resource_registration_endpoint:	config.gluuServerAddress + '/oxauth/restv1/host/rsrc/resource_set',
  permission_endpoint:	config.gluuServerAddress + '/oxauth/restv1/host/rsrc_pr',
  rpt_endpoint: config.gluuServerAddress + '/oxauth/restv1/rpt/status'
}); // => Issuer

// create client with given id and secret
const client = new gluuIssuer.Client({
    client_id: config.resourceServerId,
    client_secret: config.resourceServerSecret
}); // => Client

// build the correct
// TODO: What is nonce? => association between id-token and client
function auth() {
    return client.authorizationPost({
    redirect_uri: config.resourceServerAddress + '/callback',
    scope: "openid uma_protection",
    state: '1234',
    nonce: '1234',
    response_type: 'code',
    response_mode: 'query'}); // => String (Valid HTML body)
}

/* #############################################################################
 *                                routing
 * ###########################################################################*/

// // path to index of the client
// app.get ('/', function(req, res) {
//     res.sendFile(__dirname + "/spectral/index.html")
// });
//
// // select scopes to send to Authorization Server
// app.get ('/scopes', function(req, res) {
//     res.sendFile(__dirname + "/spectral/scopes.html")
// });

// to initiate a new openid process
// http://localhost:3000/login
app.get('/login', function (req, res) {
  ies = req.query["scopes"];
  res.send(auth());
});

// callback endpoint (comming back from login with accesstoken)
app.get('/callback', function(request, res) {
  const state = "1234";
  const nonce = "1234";
  client.authorizationCallback(config.resourceServerAddress + '/callback',
  request.query, {state, nonce})
  .then(function (tokenSet) {
    console.log("Login performed correctly, received TokenSet");
    tokenS = tokenSet;
    res.send(tokenS);
  });
});

// endpoint to request resource sets information
app.get('/resource_sets', function(req, res) {
  if(tokenS.access_token){
    client.resource_set(tokenS.access_token)
    .then(function (resp) {
      resourceId = resp.replace(/\"|\[|\]/g, '');
      console.log("Available Resources with Resource_ID: " + resourceId);
      res.setHeader('Content-Type', 'text/html');
      res.send(getHtml(config.resourceServerAddress + '/resource_sets/'
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
      console.log(umaTokenSet);
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
    client.registerResource(tokenS, getResource())
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
          res.setHeader('WWW-Authenticate', 'UMA realm=' + config.umaRealm);
          var uri = { as_uri: config.gluuServerAddess }
          var data = Object.assign(umaTicket, uri)
          res.send(data);
          res.end();
        });
      } else {
          console.log("No Resource Information available!");
      }
    } else {
      var rpt = authHeader.replace('Bearer ', '');
      console.log(rpt);
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

// userinfo endpoint (requests userInfo and displays it)
// http://localhost:3000/userInfo
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

app.post('/measurementData', function(request, res) {
  var measurement = request.body.data;
  fs.writeFile('measurementData.txt', measurement, function (err) {
    if (err) throw err;
      console.log('Saved file!');
      res.end();
    });

});

app.listen(config.resourceServerPort, function () {
  console.log('Listen on port ' + config.resourceServerPort);
});

/* #############################################################################
 *                              helper methods
 * ###########################################################################*/

function getHtml(link,id) {
  return `<!DOCTYPE html>
<head>
<title>Requesting Authorization</title>
</head>
<body>
<p>ID: ` + id + `</p>
<a href="` + link + `">Get Infomation for the ID</a>
</body>
</html>`;
};

function getResource() {
  return `{
   "_id":"KX3A-39WE",
   "resource_scopes":[
      "hearthRate"
   ],
   "icon_uri":"http://www.example.com/icons/sharesocial.png",
   "name":"Hearth Rate Service",
   "type":"http://www.example.com/rsrcs/socialstream/140-compatible",
   "exp": 1419356238,
   "iat": 1419350238
}`;
};
