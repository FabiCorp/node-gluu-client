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

var serverAddress = config.init.gluuServerAddress;

var initIssuer = new Issuer({
  issuer: serverAddress,
  authorization_endpoint: serverAddress +
  '/oxauth/restv1/authorize/',
  token_endpoint: serverAddress +
  '/oxauth/restv1/token',
  userinfo_endpoint: serverAddress +
  '/oxauth/restv1/userinfo',
  jwks_uri: serverAddress +
  '/oxauth/restv1/jwks',
  resource_registration_endpoint:	serverAddress +
  '/oxauth/restv1/host/rsrc/resource_set',
  permission_endpoint: serverAddress +
  '/oxauth/restv1/host/rsrc_pr',
  rpt_endpoint: serverAddress +
  '/oxauth/restv1/rpt/status'
});

var auth = (client, config) => {
   return client.authorizationPost({
   redirect_uri: config + '/callback',
   scope: "openid uma_protection",
   state: '1234',
   nonce: '1234',
   response_type: 'code',
   response_mode: 'query'});
};

var readFile = (fileName) => {
  var filePath = path.join(__dirname, 'resources', fileName);
  return fs.readFileSync(filePath, 'utf8', (err, data) => {
    if (err) throw err;
  });
}

var saveToFile = (fileName, fileData) => {
  var filePath = path.join(__dirname, 'resources', fileName);
  fs.writeFile(filePath, fileData, (err) => {
    if (err) throw err;
      console.log('Saved file!');
    });
};

var resourceHtml = () => {
  var filePath = path.join(__dirname, 'resources', 'resourceSet.html');
    return fs.readFileSync(filePath, 'utf8', (err, data) => {
        if (err) throw err;
      });
};

/* #############################################################################
 *                                 exports
 * ###########################################################################*/

module.exports = {
  readFile,
  saveToFile,
  auth,
  resourceHtml,
  initIssuer
};
