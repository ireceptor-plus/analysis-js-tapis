'use strict';

//
// analysisController.js
// Process analysis requests
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


var config = require('../config/config');

// Controllers
var apiResponseController = require('./apiResponseController');

// Models
var ServiceAccount = require('../models/serviceAccount');
var Job = require('../models/job');

// Processing
var tapisIO = require('../vendor/tapisIO');

// Analysis mapping
var mapping = require('../config/mapping');

// Node Libraries
var kue = require('kue');
//var taskQueue = kue.createQueue({
//    redis: app.redisConfig,
//});

var AnalysisController = {};
module.exports = AnalysisController;

AnalysisController.getAnalysisStatus = function(request, response) {

    var analysis_id = request.params.analysis_id;

    var analysis_info = null
    tapisIO.getMetadata(analysis_id)
        .then(function(obj) {
            analysis_info = obj['value'];
            analysis_info['analysis_id'] = obj['uuid'];
            var job_id = analysis_info['job_id'];

            return tapisIO.getJobInfo(job_id);
        })
        .then(function(job_info) {
            analysis_info['job_info'] = job_info;
            analysis_info['status'] = job_info['status'];

            response.status(200).json(analysis_info);
        })
        .catch(function(errorObject) {
            console.error(errorObject);
            apiResponseController.sendError(errorObject, 500, response);
        });
};

AnalysisController.DefineClones = function(request, response) {

    apiResponseController.sendSuccess('', response);
};

AnalysisController.GeneUsage = function(request, response) {
    if (config.debug) console.log('IRPLUS-ANALYSIS-API INFO: AnalysisController.GeneUsage');
    console.log(request.body);

    var analysis = "gene_usage";
    var analysisMetadata = null;
    var job = new Job();

    // Create a metadata record for the job info
    var value = {
        analysis: analysis,
        request: request.body
    };
    tapisIO.createMetadataForType(null, 'irplus_analysis', value)
        .then(function(obj) {
            analysisMetadata = obj;
            console.log(obj);

            // Create an archive path to hold job output
            job['archiveSystem'] = 'data.vdjserver.org';
            job['archivePath'] = '/irplus/data/analysis/' + analysisMetadata.uuid;
            job['archive'] = true;
            console.log(job);
            
            return tapisIO.createDirectory(job['archiveSystem'], '/irplus/data/analysis', analysisMetadata.uuid);
        })
        .then(function() {
            // Create job definition
            var result = job.defineForAnalysis(analysis, request.body);
            if (!result) return Promise.reject(new Error('Unable to create job definition.'));
            
            // set the execution level
            result = job.defineExecutionLevel(analysis, request.body);
            if (!result) return Promise.reject(new Error('Unable to define execution level for job.'));
            
            // Submit job
            console.log(job);
            return tapisIO.launchJob(job);
        })
        .then(function(jobData) {
            console.log(jobData);
            
            // save job info into metadata
            analysisMetadata['value']['job_id'] = jobData['id'];
            
            return tapisIO.updateMetadata(analysisMetadata['uuid'], analysisMetadata['name'], analysisMetadata['value'], analysisMetadata['associationIds']);
        })
        .then(function() {
            // TODO: permissions for users?

            response.status(200).json({analysis_id: analysisMetadata.uuid});
        })
        .catch(function(errorObject) {
            console.error(errorObject);
            apiResponseController.sendError(errorObject, 500, response);
        });
};
