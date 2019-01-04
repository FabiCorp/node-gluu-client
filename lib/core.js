/* #############################################################################
 *                           require-statements
 * ###########################################################################*/
const configIni   = require('config.ini');
const Issuer      = require('openid-client').Issuer;
const fs          = require('fs');
const path        = require('path');
const MongoClient = require('mongodb').MongoClient;
const mongodb     = require('mongodb');

const config     = configIni.load('config.ini');

/* #############################################################################
 *                           core functions
 * ###########################################################################*/
const dbUrl = "mongodb://localhost:27017/";
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

//measurement should be a json object
var insertMeasurement = (dbName ,measurement) => {
  MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbConnection = db.db(dbName);
    measurement._id = mongodb.ObjectId(measurement._id)
    measurement.time = new Date(measurement.time)
    dbConnection.collection("measurement")
      .insertOne(measurement, function(err, res) {
        if (err && err.code !== 11000) {
          throw err;
        }
        if (err && err.code === 11000) {
          console.log("measureObject exists");
          return;
        }
        console.log("measureObject inserted");
        db.close();
      });
  });
}

var getAllMeasurements = (dbName, callback) => {
  MongoClient.connect(dbUrl, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbConnection = db.db(dbName);
    dbConnection.collection("measurement").find({}).toArray(function(err, result) {
      if (err) throw err;
      db.close();
      var resultJson = [];
      result.forEach(function(element) {

      });
      callback(result);
    });
  });
}

/* #############################################################################
 *                                 exports
 * ###########################################################################*/

module.exports = {
  readFile,
  saveToFile,
  auth,
  resourceHtml,
  initIssuer,
  insertMeasurement,
  getAllMeasurements
};
