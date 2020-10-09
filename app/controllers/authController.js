
'use strict';

//
// authController.js
// Handle security and authorization checks
//
// iReceptor Plus
// Analysis API
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

var AuthController = {};
module.exports = AuthController;

// API config
var config = require('../config/config');

// App
var app = require('../app');

// Controllers
var apiResponseController = require('./apiResponseController');

// Models
var ServiceAccount = require('../models/serviceAccount');

// Processing
var tapisIO = require('../vendor/tapisIO');
//var webhookIO = require('../vendor/webhookIO');

// Extract token from header
AuthController.extractToken = function(req) {
    // extract the token from the authorization header
    if (! req['headers']['authorization']) {
        let msg = 'IRPLUS-ANALYSIS-API ERROR: AuthController.userAuthorization - missing authorization header';
        console.error(msg);
        //webhookIO.postToSlack(msg);
        return false;
    }
    var fields = req['headers']['authorization'].split(' ');
    if (fields.length != 2) {
        let msg = 'IRPLUS-ANALYSIS-API ERROR: AuthController.userAuthorization - invalid authorization header: ' + req['headers']['authorization'];
        console.error(msg);
        //webhookIO.postToSlack(msg);
        return false;
    }
    if (fields[0].toLowerCase() != 'bearer') {
        let msg = 'IRPLUS-ANALYSIS-API ERROR: AuthController.userAuthorization - invalid authorization header: ' + req['headers']['authorization'];
        console.error(msg);
        //webhookIO.postToSlack(msg);
        return false;
    }
    return fields[1];
}

//
// Security handlers, these are called by the openapi
// middleware. Return true if authentication is valid,
// otherwise return false. The middleware will throw
// a generic 401 error, which the errorMiddleware returns
// to the client
//

// Verify a Tapis token
// Sets the associated user profile for the token in req.user
AuthController.userAuthorization = function(req, scopes, definition) {
    if (config.debug) console.log('IRPLUS-ANALYSIS-API INFO: AuthController.userAuthorization');

    var token = AuthController.extractToken(req);
    if (!token) return false;

    // get my profile and username from the token
    // return a promise
    return tapisIO.getAgaveUserProfile(token, 'me')
        .then(function(userProfile) {
            // save the user profile
            req['user'] = userProfile;

            // now check that the user account has been verified
            return tapisIO.getUserVerificationMetadata(req['user']['username']);
        })
        .then(function(userVerificationMetadata) {
            if (userVerificationMetadata && userVerificationMetadata[0] && userVerificationMetadata[0].value.isVerified === true) {
                // valid
                return true;
            }
            else {
                var msg = 'IRPLUS-ANALYSIS-API ERROR: AuthController.userAuthorization - access by unverified user: ' + req['user']['username'];
                console.error(msg);
                //webhookIO.postToSlack(msg);
                return false;
            }
        })
        .catch(function(error) {
            var msg = 'IRPLUS-ANALYSIS-API ERROR: AuthController.userAuthorization - invalid token: ' + token + ', error: ' + error;
            console.error(msg);
            //webhookIO.postToSlack(msg);
            return false;
        });
}

//
// verify a valid and active username account
//
AuthController.verifyUser = function(username) {

    if (username == undefined) return false;

    // return a promise
    return tapisIO.getUserVerificationMetadata(username)
        .then(function(userVerificationMetadata) {
            if (userVerificationMetadata && userVerificationMetadata[0] && userVerificationMetadata[0].value.isVerified === true) {
                // valid
                return true;
            }
            else {
                return false;
            }
        })
        .catch(function(error) {
            var msg = 'IRPLUS-ANALYSIS-API ERROR: AuthController.verifyUser - error validating user: ' + username + ', error ' + error;
            console.error(msg);
            //webhookIO.postToSlack(msg);
            return false;
        })
        ;
}

//
// verify user has access to metadata entry
//
AuthController.verifyMetadataAccess = function(uuid, accessToken, username) {

    if (uuid == undefined) return false;
    if (accessToken == undefined) return false;
    if (username == undefined) return false;

    return tapisIO.getMetadataPermissionsForUser(accessToken, uuid, username)
        .then(function(metadataPermissions) {
            // we can read the metadata, but do we have write permission?
            if (metadataPermissions && metadataPermissions.permission.write)
                return true;
            else {
                return false;
            }
        })
        .catch(function(error) {
            var msg = 'IRPLUS-ANALYSIS-API ERROR: AuthController.verifyMetadataAccess - uuid: ' + uuid
                + ', error validating user: ' + username + ', error ' + error;
            console.error(msg);
            //webhookIO.postToSlack(msg);
            return false;
        });
}

