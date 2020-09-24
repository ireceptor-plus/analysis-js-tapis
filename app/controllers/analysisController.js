'use strict';

//
// analysisController.js
// Process analysis requests
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

// Controllers
var apiResponseController = require('./apiResponseController');

// Models
var ServiceAccount = require('../models/serviceAccount');

// Processing
var tapisIO = require('../vendor/tapisIO');

// Node Libraries
var Q = require('q');
var kue = require('kue');
//var taskQueue = kue.createQueue({
//    redis: app.redisConfig,
//});

var AnalysisController = {};
module.exports = AnalysisController;

AnalysisController.getAnalysisStatus = function(request, response) {

    apiResponseController.sendSuccess('', response);
};

AnalysisController.DefineClones = function(request, response) {

    apiResponseController.sendSuccess('', response);
};

AnalysisController.GeneUsage = function(request, response) {

    apiResponseController.sendError('Not implemented', 500, response);
};
