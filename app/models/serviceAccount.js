'use strict';

//
// serviceAccount.js
// Tapis service account
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

// Node Libraries
var tapisSettings = require('../config/tapisSettings');
var TapisToken = require('./tapisToken');

var ServiceAccount = {
    username: tapisSettings.serviceAccountKey,
    password: tapisSettings.serviceAccountSecret,
    tapisToken: null
};

module.exports = ServiceAccount;

// Processing
var tapisIO = require('../vendor/tapisIO');

ServiceAccount.getToken = function() {

    var that = this;

    return tapisIO.getToken(this)
        .then(function(responseObject) {
            that.tapisToken = new TapisToken(responseObject);
            return Promise.resolve(that.tapisToken);
        })
        .catch(function(errorObject) {
            console.log('IRPLUS-API ERROR: Unable to login with service account. ' + errorObject);
            return Promise.reject(errorObject);
        });
}

ServiceAccount.accessToken = function() {
    return this.tapisToken.access_token;
}
