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
var _ = require('underscore');
var jsonApprover = require('json-approver');
var FormData = require('form-data');

var tapisIO  = {};
module.exports = tapisIO;

//
// Generic send request
//
tapisIO.sendRequest = function(requestSettings, postData) {

    return new Promise(function(resolve, reject) {
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
                    reject(new Error('Response is not json. Raw output: ' + output));
                }

                if (responseObject && responseObject.status && responseObject.status.toLowerCase() === 'success') {
                    resolve(responseObject);
                }
                else {
                    reject(new Error('Response returned an error: ' + JSON.stringify(responseObject)));
                }

            });
        });

        request.on('error', function(error) {
            reject(new Error('Connection error'));
        });

        if (postData) {
            // Request body parameters
            request.write(postData);
        }

        request.end();
    });
};

//
// token request
//
tapisIO.sendTokenRequest = function(requestSettings, postData) {

    return new Promise(function(resolve, reject) {
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
                    reject(new Error('Response is not json'));
                }

                if (responseObject
                    && responseObject.access_token
                    && responseObject.refresh_token
                    && responseObject.token_type
                    && responseObject.expires_in)
                {
                    resolve(responseObject);
                } else {
                    reject(new Error('Response returned an error: ' + JSON.stringify(responseObject)));
                }
            });
        });

        request.on('error', function() {
            reject(new Error('Connection error'));
        });

        if (postData) {
            // Request body parameters
            request.write(postData);
        }

        request.end();
    });
};

// Fetches a user token based on the supplied auth object
// and returns the auth object with token data on success
tapisIO.getToken = function(auth) {

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

    return tapisIO.sendTokenRequest(requestSettings, postData);
};

// Refreshes a token and returns it on success
tapisIO.refreshToken = function(auth) {
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

    return tapisIO.sendTokenRequest(requestSettings, postData);
};

//
// User account operations
//
tapisIO.getAgaveUserProfile = function(accessToken, username) {

    return ServiceAccount.getToken()
        .then(function(token) {
            var requestSettings = {
                host:   tapisSettings.hostname,
                method: 'GET',
                path:   '/profiles/v2/' + username,
                rejectUnauthorized: false,
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            };

            return tapisIO.sendRequest(requestSettings, null);
        })
        .then(function(responseObject) {
            return Promise.resolve(responseObject.result);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};

tapisIO.getUserVerificationMetadata = function(username) {

    return ServiceAccount.getToken()
        .then(function(token) {
            var requestSettings = {
                host:     tapisSettings.hostname,
                method:   'GET',
                path:     '/meta/v2/data?q='
                    + encodeURIComponent(
                        '{"name":"userVerification",'
                            + ' "value.username":"' + username + '",'
                            + ' "owner":"' + ServiceAccount.username + '"'
                            + '}'
                    )
                    + '&limit=1'
                ,
                rejectUnauthorized: false,
                headers: {
                    'Authorization': 'Bearer ' + ServiceAccount.accessToken()
                }
            };

            return tapisIO.sendRequest(requestSettings, null);
        })
        .then(function(responseObject) {
            return Promise.resolve(responseObject.result);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};

tapisIO.getMetadataPermissionsForUser = function(accessToken, uuid, username) {

    var requestSettings = {
        host:     tapisSettings.hostname,
        method:   'GET',
        path:     '/meta/v2/data/' + uuid + '/pems/' + username,
        rejectUnauthorized: false,
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    };

    return tapisIO.sendRequest(requestSettings, null)
        .then(function(responseObject) {
            return Promise.resolve(responseObject.result);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};

//
// Metadata operations
//

// get single metadata record
tapisIO.getMetadata = function(uuid) {

    return ServiceAccount.getToken()
        .then(function(token) {
            var requestSettings = {
                host:     tapisSettings.hostname,
                method:   'GET',
                path:     '/meta/v2/data/' + uuid,
                rejectUnauthorized: false,
                headers: {
                    'Authorization': 'Bearer ' + ServiceAccount.accessToken()
                }
            };

            return tapisIO.sendRequest(requestSettings, null);
        })
        .then(function(responseObject) {
            return Promise.resolve(responseObject.result);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};

// generic metadata query
tapisIO.getMetadataForType = function(analysisUuid, type) {

    var models = [];

    var doFetch = function(accessToken, offset) {
        var requestSettings = {
            host:     tapisSettings.hostname,
            method:   'GET',
            path:   '/meta/v2/data?q='
                + encodeURIComponent('{'
                                     + '"name": "' + type + '",'
                                     + '"associationIds": "' + analysisUuid + '"'
                                     + '}')
                + '&limit=50&offset=' + offset,
            rejectUnauthorized: false,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        };

        return tapisIO.sendRequest(requestSettings, null)
            .then(function(responseObject) {
                var result = responseObject.result;
                if (result.length > 0) {
                    // maybe more data
                    models = models.concat(result);
                    var newOffset = offset + result.length;
                    return doFetch(accessToken, newOffset);
                } else {
                    // no more data
                    return Promise.resolve(models);
                }
            })
            .catch(function(errorObject) {
                return Promise.reject(errorObject);
            });
    }

    return ServiceAccount.getToken()
        .then(function() {
            return doFetch(ServiceAccount.accessToken(), 0);
        })
        .then(function(responseObject) {
            return Promise.resolve(responseObject);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};

// generic metadata creation
tapisIO.createMetadataForType = function(analysisUuid, type, value) {

    var postData = {
        name: type,
        value: value,
    };
    if (analysisUuid) postData['associationIds'] = [ analysisUuid ];

    postData = JSON.stringify(postData);

    return ServiceAccount.getToken()
        .then(function(token) {
            var requestSettings = {
                host:     tapisSettings.hostname,
                method:   'POST',
                path:     '/meta/v2/data',
                rejectUnauthorized: false,
                headers: {
                    'Content-Type':   'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'Authorization': 'Bearer ' + ServiceAccount.accessToken()
                }
            };

            return tapisIO.sendRequest(requestSettings, postData);
        })
        .then(function(responseObject) {
            return Promise.resolve(responseObject.result);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};

tapisIO.updateMetadata = function(uuid, name, value, associationIds) {

    var postData = {
        name: name,
        value: value
    };
    if (associationIds) postData.associationIds = associationIds;

    postData = JSON.stringify(postData);

    return ServiceAccount.getToken()
        .then(function(token) {
            var requestSettings = {
                host:     tapisSettings.hostname,
                method:   'POST',
                path:     '/meta/v2/data/' + uuid,
                rejectUnauthorized: false,
                headers: {
                    'Content-Type':   'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'Authorization': 'Bearer ' + ServiceAccount.accessToken()
                }
            };
            return tapisIO.sendRequest(requestSettings, postData);
        })
        .then(function(responseObject) {
            return Promise.resolve(responseObject.result);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};

//
// File operations
//

tapisIO.createDirectory = function(system, path, directory) {

    var postData = 'action=mkdir&path=' + directory;

    return ServiceAccount.getToken()
        .then(function(token) {
            var requestSettings = {
                host:     tapisSettings.hostname,
                method:   'PUT',
                path:     '/files/v2/media/system/' + system + '/' + path,
                rejectUnauthorized: false,
                headers: {
                    'Content-Length': Buffer.byteLength(postData),
                    'Authorization': 'Bearer ' + ServiceAccount.accessToken()
                },
            };
            console.log(requestSettings);

            return tapisIO.sendRequest(requestSettings, postData);
        })
        .then(function(responseObject) {
            return Promise.resolve(responseObject.result);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};

//
// Job operations
//


// submit Tapis job
tapisIO.launchJob = function(jobDataString) {

    var postData = JSON.stringify(jobDataString);
    console.log(postData);

    return ServiceAccount.getToken()
        .then(function(token) {
            var requestSettings = {
                host:     tapisSettings.hostname,
                method:   'POST',
                path:     '/jobs/v2/'
                ,
                rejectUnauthorized: false,
                headers: {
                    'Content-Length': Buffer.byteLength(postData),
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + ServiceAccount.accessToken()
                },
            };

            return tapisIO.sendRequest(requestSettings, postData);
        })
        .then(function(responseObject) {
            return Promise.resolve(responseObject.result);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};

// Tapis job info
tapisIO.getJobInfo = function(jobId) {

    return ServiceAccount.getToken()
        .then(function(token) {
            var requestSettings = {
                host:     tapisSettings.hostname,
                method:   'GET',
                path:     '/jobs/v2/' + jobId,
                rejectUnauthorized: false,
                headers: {
                    'Authorization': 'Bearer ' + ServiceAccount.accessToken()
                }
            };

            return tapisIO.sendRequest(requestSettings, null);
        })
        .then(function(responseObject) {
            return Promise.resolve(responseObject.result);
        })
        .catch(function(errorObject) {
            return Promise.reject(errorObject);
        });
};
