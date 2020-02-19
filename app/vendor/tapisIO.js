'use strict';

//
// tapisIO.js
// Wrapper functions for accessing the Tapis APIs
//
// iReceptor Plus
// http://ireceptor-plus.com
//
// Copyright (C) 2020 The University of Texas Southwestern Medical Center
//
// Author: Scott Christley <scott.christley@utsouthwestern.edu>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
//

// Settings
var tapisSettings = require('../config/tapisSettings');

// Models
var ServiceAccount = require('../models/serviceAccount');
//var MetadataPermissions = require('../models/metadataPermissions');

// Node Libraries
var Q = require('q');
var _ = require('underscore');
var jsonApprover = require('json-approver');
var FormData = require('form-data');

var tapisIO  = {};
module.exports = tapisIO;

//
// Generic send request
//
tapisIO.sendRequest = function(requestSettings, postData) {

    var deferred = Q.defer();

    var request = require('https').request(requestSettings, function(response) {

        var output = '';

        response.on('data', function(chunk) {
            output += chunk;
        });

        response.on('end', function() {

            var responseObject;

            if (output && jsonApprover.isJSON(output)) {
                responseObject = JSON.parse(output);
            }
            else {

                if (tapisSettings.debugConsole === true) {
                    console.error('IRPLUS-API ERROR: Tapis response is not json.');
                }

                deferred.reject(new Error('Tapis response is not json'));
            }

            if (responseObject && responseObject.status && responseObject.status.toLowerCase() === 'success') {
                deferred.resolve(responseObject);
            }
            else {

                if (tapisSettings.debugConsole === true) {
                    console.error('IRPLUS-API ERROR: Tapis returned an error. it is: ' + JSON.stringify(responseObject));
                    console.error('IRPLUS-API ERROR: Tapis returned an error. it is: ' + responseObject);
                }

                deferred.reject(new Error('Tapis response returned an error: ' + JSON.stringify(responseObject)));
            }

        });
    });

    request.on('error', function(error) {
        if (tapisSettings.debugConsole === true) {
            console.error('IRPLUS-API ERROR: Tapis connection error.' + JSON.stringify(error));
        }

        deferred.reject(new Error('Tapis connection error'));
    });

    if (postData) {
        // Request body parameters
        request.write(postData);
    }

    request.end();

    return deferred.promise;
};

//
// This is specific to sending multi-part form post data, i.e. uploading files
//
tapisIO.sendFormRequest = function(requestSettings, formData) {

    var deferred = Q.defer();

    var request = formData.submit(requestSettings, function(error, response) {

        var output = '';

        response.on('data', function(chunk) {
            output += chunk;
        });

        response.on('end', function() {

            var responseObject;

            if (output && jsonApprover.isJSON(output)) {
                responseObject = JSON.parse(output);
            }
            else {

                if (tapisSettings.debugConsole === true) {
                    console.error('IRPLUS-API ERROR: Tapis response is not json.');
                }

                deferred.reject(new Error('Tapis response is not json'));
            }

            if (responseObject && responseObject.status && responseObject.status.toLowerCase() === 'success') {
                deferred.resolve(responseObject);
            }
            else {

                if (tapisSettings.debugConsole === true) {
                    console.error('IRPLUS-API ERROR: Tapis returned an error. it is: ' + JSON.stringify(responseObject));
                    console.error('IRPLUS-API ERROR: Tapis returned an error. it is: ' + responseObject);
                }

                deferred.reject(new Error('Tapis response returned an error: ' + JSON.stringify(responseObject)));
            }

        });
    });

    request.on('error', function(error) {
        if (tapisSettings.debugConsole === true) {
            console.error('IRPLUS-API ERROR: Tapis connection error.' + JSON.stringify(error));
        }

        deferred.reject(new Error('Tapis connection error. ' + JSON.stringify(error)));
    });

    return deferred.promise;
};

tapisIO.sendTokenRequest = function(requestSettings, postData) {

    var deferred = Q.defer();

    var request = require('https').request(requestSettings, function(response) {

        var output = '';

        response.on('data', function(chunk) {
            output += chunk;
        });

        response.on('end', function() {

            var responseObject;

            if (output && jsonApprover.isJSON(output)) {
                responseObject = JSON.parse(output);
            }
            else {

                if (tapisSettings.debugConsole === true) {
                    console.error('IRPLUS-API ERROR: Tapis token response is not json.');
                }

                deferred.reject(new Error('Tapis response is not json'));
            }

            if (
                responseObject
                && responseObject.access_token
                && responseObject.refresh_token
                && responseObject.token_type
                && responseObject.expires_in
            ) {
                deferred.resolve(responseObject);
            }
            else {

                if (tapisSettings.debugConsole === true) {
                    console.error('IRPLUS-API ERROR: Tapis returned a token error. it is: ' + JSON.stringify(responseObject));
                    console.error('IRPLUS-API ERROR: Tapis returned a token error. it is: ' + responseObject);
                }

                deferred.reject(new Error('Tapis response returned an error: ' + JSON.stringify(responseObject)));
            }

        });
    });

    request.on('error', function() {

        if (tapisSettings.debugConsole === true) {
            console.error('IRPLUS-API ERROR: Tapis token connection error.');
        }

        deferred.reject(new Error('Tapis connection error'));
    });

    if (postData) {
        // Request body parameters
        request.write(postData);
    }

    request.end();

    return deferred.promise;
};

//
// For checking existence of files/folders
// does not reject promise with a 404 error
//
tapisIO.sendCheckRequest = function(requestSettings, postData) {

    var deferred = Q.defer();

    var request = require('https').request(requestSettings, function(response) {

        var output = '';

        response.on('data', function(chunk) {
            output += chunk;
        });

        response.on('end', function() {

            var responseObject;

            if (output && jsonApprover.isJSON(output)) {
                responseObject = JSON.parse(output);
            } else {

                if (tapisSettings.debugConsole === true) {
                    console.error('IRPLUS-API ERROR: Tapis response is not json.');
                }

                deferred.reject(new Error('Tapis response is not json'));
            }

            if (responseObject && responseObject.status && responseObject.status.toLowerCase() === 'success') {
		deferred.resolve(responseObject);
            } else {
		if (responseObject.status.toLowerCase() === 'error' && response.statusCode == 404) {
		    deferred.resolve(responseObject);
		} else {
                    if (tapisSettings.debugConsole === true) {
			console.error('IRPLUS-API ERROR: Tapis returned an error. it is: ' + JSON.stringify(responseObject));
			console.error('IRPLUS-API ERROR: Tapis returned an error. it is: ' + responseObject);
                    }
                    deferred.reject(new Error('Tapis response returned an error: ' + JSON.stringify(responseObject)));
		}
	    }	    
        });
    });

    request.on('error', function(error) {
        if (tapisSettings.debugConsole === true) {
            console.error('IRPLUS-API ERROR: Tapis connection error.' + JSON.stringify(error));
        }

        deferred.reject(new Error('Tapis connection error'));
    });

    if (postData) {
        // Request body parameters
        request.write(postData);
    }

    request.end();

    return deferred.promise;
};

// Fetches a user token based on the supplied auth object
// and returns the auth object with token data on success
tapisIO.getToken = function(auth) {

    var deferred = Q.defer();

    var postData = 'grant_type=password&scope=PRODUCTION&username=' + auth.username + '&password=' + auth.password;

    var requestSettings = {
        host:     tapisSettings.hostname,
        method:   'POST',
        auth:     tapisSettings.clientKey + ':' + tapisSettings.clientSecret,
        path:     '/token',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    tapisIO.sendTokenRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

// Refreshes a token and returns it on success
tapisIO.refreshToken = function(auth) {

    var deferred = Q.defer();

    var postData = 'grant_type=refresh_token&scope=PRODUCTION&refresh_token=' + auth.refresh_token;

    var requestSettings = {
        host:     tapisSettings.hostname,
        method:   'POST',
        auth:     tapisSettings.clientKey + ':' + tapisSettings.clientSecret,
        path:     '/token',
        rejectUnauthorized: false,
        headers: {
            'Content-Type':   'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    tapisIO.sendTokenRequest(requestSettings, postData)
        .then(function(responseObject) {
            deferred.resolve(responseObject);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};

// submit Tapis job
tapisIO.launchJob = function(jobDataString) {

    var deferred = Q.defer();

    ServiceAccount.getToken()
	.then(function(token) {
	    var requestSettings = {
		host:     tapisSettings.hostname,
		method:   'POST',
		path:     '/jobs/v2/'
                ,
		rejectUnauthorized: false,
		headers: {
		    'Content-Length': Buffer.byteLength(jobDataString),
		    'Content-Type': 'application/json',
		    'Authorization': 'Bearer ' + ServiceAccount.accessToken()
		},
	    };

	    return tapisIO.sendRequest(requestSettings, jobDataString);
	})
        .then(function(responseObject) {
            deferred.resolve(responseObject.result);
        })
        .fail(function(errorObject) {
            deferred.reject(errorObject);
        });

    return deferred.promise;
};
