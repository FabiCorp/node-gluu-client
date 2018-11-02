/* #############################################################################
 *                           require-statements
 * ###########################################################################*/
const configIni  = require('config.ini');
const Issuer     = require('openid-client').Issuer;
const fs         = require('fs');
const path       = require('path');

const config = configIni.load('config.ini');

/* #############################################################################
 *                           core functions
 * ###########################################################################*/

var getIssuer = new Issuer({
  issuer: config.init.gluuServerAddress,
  authorization_endpoint: config.init.gluuServerAddress + '/oxauth/restv1/authorize/',
  token_endpoint: config.init.gluuServerAddress + '/oxauth/restv1/token',
  userinfo_endpoint: config.init.gluuServerAddress + '/oxauth/restv1/userinfo',
  jwks_uri: config.init.gluuServerAddress + '/oxauth/restv1/jwks',
  resource_registration_endpoint:	config.init.gluuServerAddress + '/oxauth/restv1/host/rsrc/resource_set',
  permission_endpoint:	config.init.gluuServerAddress + '/oxauth/restv1/host/rsrc_pr',
  rpt_endpoint: config.init.gluuServerAddress + '/oxauth/restv1/rpt/status'
});

var auth = (client, config) => {
   return client.authorizationPost({
   redirect_uri: config + '/callback',
   scope: "openid uma_protection",
   state: '1234',
   nonce: '1234',
   response_type: 'code',
   response_mode: 'query'}); // => String (Valid HTML body)
};

var readFile = (fileName) => {
  var filePath = path.join(__dirname , 'resources', fileName);
  return fs.readFileSync(filePath, 'utf8', (err, data) => {
    if (err) throw err;
  });
}

var saveToFile = (fileName, fileData) => {
  var filePath = path.join(__dirname , 'resources', fileName);
  fs.writeFile(filePath, fileData, (err) => {
    if (err) throw err;
      console.log('Saved file!');
    });
};

var resourceHtml = (link, id) => {
    return `<!DOCTYPE html>
  <head>
  <title>Requesting Authorization</title>
  </head>
  <body>
  <p>ID: ${id}</p>
  <a href="${link}">Get Infomation for the ID</a>
  </body>
  </html>`;
};

/* #############################################################################
 *                                 exports
 * ###########################################################################*/

module.exports = {
  readFile,
  saveToFile,
  auth,
  resourceHtml,
  getIssuer
};
