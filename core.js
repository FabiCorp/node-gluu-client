
const configIni  = require('config.ini');
const Issuer     = require('openid-client').Issuer;

var config = configIni.load('config.ini');

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

var saveFile = (fileName, fileData) => {
  fs.writeFile(fileName, fileData, function (err) {
    if (err) throw err;
      console.log('Saved file!');
      res.end();
    });
};

var auth = (client, config) => {
   return client.authorizationPost({
   redirect_uri: config + '/callback',
   scope: "openid uma_protection",
   state: '1234',
   nonce: '1234',
   response_type: 'code',
   response_mode: 'query'}); // => String (Valid HTML body)
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

module.exports = {
  saveFile,
  auth,
  resourceHtml,
  getIssuer
};
