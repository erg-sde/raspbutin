/* jshint maxparams: false */

let util = require('util'), exec = require('child_process').exec
  say = require('say');

var request = require('request');
var config = {
  "userId": "UPGJ6660O5UZ1B59NDT421gvzmkH6xl-mqa7-OOXTgUtpbc1s",
  "password": "jt2JffyBP7vOPGcFok9A0rqojD4uw7t4p9h",
  "cert": "/home/pi/matrix-os/apps/raspbutin.matrix/cert.pem",
  "key": "/home/pi/matrix-os/apps/raspbutin.matrix/key_private.pem",
  "visaUrl": "https://sandbox.api.visa.com/"
};

let logRequest = function(requestBody, path) {
      console.log("URL : " + config.visaUrl + path);
      if (requestBody !== null && requestBody !== '') {
        console.log("Request Body : " + JSON.stringify(JSON.parse(requestBody),null,4));
      }
    },
    logResponseBody = function(response, body) {
      console.log("Response Code: " + response.statusCode);
      console.log("Headers:");
      for(var item in response.headers) {
        console.log(item + ": " + response.headers[item]);
      }
      console.log("Body: "+ JSON.stringify(JSON.parse(body),null,4));
    },
    getBasicAuthHeader = function(userId, password) {
      return 'Basic ' + new Buffer(userId + ':' + password).toString('base64');
    },
    getXPayToken = function(resourcePath , queryParams , postBody) {
      var timestamp = Math.floor(Date.now() / 1000);
      var sharedSecret = config.sharedSecret;
      var preHashString = timestamp + resourcePath + queryParams + postBody;
      var hashString = crypto.createHmac('SHA256', sharedSecret).update(preHashString).digest('hex');
      var preHashString2 = resourcePath + queryParams + postBody;
      var hashString2 = crypto.createHmac('SHA256', sharedSecret).update(preHashString2).digest('hex');
      var xPayToken = 'xv2:' + timestamp + ':' + hashString;
      return xPayToken;
    };

class VisaAPIClient {
  constructor() {
    this.request = require('request');
    this.fs = require('fs');
    this.crypto = require('crypto');
    this.randomstring = require('randomstring');
  }

    doXPayRequest(baseUri, resourcePath, queryParams, requestBody, methodType, headers, callback) {
      logRequest(requestBody, baseUri + resourcePath + '?' + queryParams);

      if (methodType === 'POST' || methodType === 'PUT') {
        headers['Content-Type'] = 'application/json';
      }

      headers.accept = 'application/json';
      headers['x-pay-token'] = getXPayToken(resourcePath, queryParams, requestBody);
      headers['ex-correlation-id'] = randomstring.generate({length:12, charset: 'alphanumeric'}) + '_SC'
      request({
        uri : config.visaUrl + baseUri + resourcePath + '?' + queryParams,
        method : methodType,
        headers: headers,
        body: requestBody
      }, function(error, response, body) {
        if (!error) {
          logResponseBody(response, body);
          callback(null, response.statusCode);
        } else {
          console.log(error);
          callback(error);
        }
      });
    }

    doMutualAuthRequest(path, requestBody, methodType, headers, callback) {
      var userId = config.userId ;
      var password = config.password;
      var keyFile = config.key;
      var certificateFile = config.cert;
      logRequest(requestBody, path);

      if (methodType === 'POST' || methodType === 'PUT') {
          headers['Content-Type'] = 'application/json';
      }

      headers.accept = 'application/json';
      headers.authorization = getBasicAuthHeader(userId, password);
      headers['ex-correlation-id'] = this.randomstring.generate({length:12, charset: 'alphanumeric'}) + '_SC'
      request({
          uri : config.visaUrl + path,
          key: this.fs.readFileSync(keyFile),
          method : methodType,
          cert: this.fs.readFileSync(certificateFile),
          headers: headers,
          body: requestBody,
          timeout: 30000
      }, function(error, response, body) {
          if (!error) {
              logResponseBody(response, body);
              callback(null, response.statusCode);
          } else {
              console.log(error);
              callback(error);
          }
      });
    }
  }

var req = request.defaults();
var userId = config.userId ;
var password = config.password;
var keyFile = config.key;
var certificateFile = config.cert;

const test_func = function() {
    var visaAPIClient = new VisaAPIClient();
    var strDate = new Date().toISOString().replace(/Z/, '');
    var locatorRequest = JSON.stringify({
        "header": {
            "messageDateTime": strDate,
            "requestMessageId": "VCO_GMR_001"
        },
        "searchAttrList": {
            "merchantName": "ALOHA CAFE",
            "merchantCountryCode": "840",
            "latitude": "34.047616",
            "longitude": "-118.239079",
            "distance": "100",
            "distanceUnit": "M"
        },
        "responseAttrList": [
        "GNLOCATOR"
        ],
        "searchOptions": {
            "maxRecords": "2",
            "matchIndicators": "true",
            "matchScore": "true"
        }
    });

    let call = function(done) {
            var baseUri = 'merchantlocator/';
            var resourcePath = 'v1/locator';
            visaAPIClient.doMutualAuthRequest(baseUri + resourcePath, locatorRequest, 'POST', {},
            function(err, response) {
              console.log(response);
            });
        }
    call();
}


matrix.service('face').start().then(function(data) {
  console.log(data);
  matrix.led('blue').render();
  setTimeout(function(){
    matrix.led('black').render();
  }, 2500);
});

matrix.service('voice').listen('matrix', function(phrase){
  console.log(phrase);
  let puts = function(error, stdout, stderr) { console.log(stdout) }
  var detail = phrase.split(' ')[1];
  var cmd = phrase.split(' ')[0];
  if ( cmd === 'shine'){
    matrix.led({color: detail, angle: 0}).render();
    say.speak(cmd + detail);
  } else if (cmd === 'turn'){
    matrix.led('black').render();
    say.speak(cmd + detail);
  } else if (cmd === 'beep'){
    say.speak(cmd);
    console.log(test_func());
  }
})
