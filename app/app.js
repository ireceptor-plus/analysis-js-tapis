'use strict';

//
// app.js
// Application entry point
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

// Express Modules
var express      = require('express');
var errorHandler = require('errorhandler');
var bodyParser   = require('body-parser');
var openapi      = require('express-openapi');
var path = require('path');
var fs = require('fs');
var yaml = require('js-yaml');
var $RefParser = require("@apidevtools/json-schema-ref-parser");

// Express app
var app = module.exports = express();

// Controllers
var apiResponseController = require('./controllers/apiResponseController');
var analysisController    = require('./controllers/analysisController');
var authController = require('./controllers/authController');

// Server Options
var config = require('./config/config');
app.set('port', config.port);

// CORS
var allowCrossDomain = function(request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' === request.method) {
        response.status(200).end();
    }
    else {
        next();
    }
};

// Server Settings
app.use(allowCrossDomain);

app.redisConfig = {
    port: 6379,
    host: 'localhost',
};

app.use(errorHandler({
    dumpExceptions: true,
    showStack: true,
}));

// Verify we can login to Tapis with service account
var ServiceAccount = require('./models/serviceAccount');
ServiceAccount.getToken()
    .then(function(serviceToken) {
        if (serviceToken) console.log('IRPLUS-ANALYSIS-API INFO: Successfully acquired service token.');

        // Load API
        var apiFile = path.resolve(__dirname, '../specifications/analysis-api.yaml');
        console.log('IRPLUS-ANALYSIS-API INFO: Using Analysis API specification: ' + apiFile);
        var api_spec = yaml.safeLoad(fs.readFileSync(apiFile, 'utf8'));
        console.log('IRPLUS-ANALYSIS-API INFO: Loaded Analysis API version: ' + api_spec.info.version);

        // dereference the API spec
        //
        // OPENAPI BUG: We should not have to do this, but openapi does not seem
        // to recognize the nullable flags or the types with $ref
        // https://github.com/kogosoftwarellc/open-api/issues/647
        return $RefParser.dereference(api_spec);
    })
    .then(function(api_schema) {
        //console.log(api_schema);

        openapi.initialize({
            apiDoc: api_schema,
            app: app,
            promiseMode: true,
            consumesMiddleware: {
                'application/json': bodyParser.json(),
                'application/x-www-form-urlencoded': bodyParser.urlencoded({extended: true})
            },
            errorMiddleware: function(err, req, res, next) {
                console.log('Got an error!');
                console.log(JSON.stringify(err));
                //console.trace("Here I am!");
                apiResponseController.sendError(err.errors, err.status, res);
                //res.status(err.status).json(err.errors);
            },
            securityHandlers: {
                user_authorization: authController.userAuthorization
            },
            operations: {
                // service status and info
                get_service_status: apiResponseController.confirmUpStatus,
                get_service_info: apiResponseController.getServiceInfo,

                get_analysis_status: analysisController.getAnalysisStatus,

                // rearrangement analysis
                define_clones: analysisController.DefineClones,
                rearrangement_gene_usage: analysisController.GeneUsage
            }
        });

        app.listen(app.get('port'), function() {
            console.log('IRPLUS-ANALYSIS-API INFO: Analysis API service listening on port ' + app.get('port'));
        });
    })
    .catch(function(error) {
        var msg = 'IRPLUS-ANALYSIS-API ERROR: Service could not be start.\n' + error;
        console.error(msg);
        console.trace(msg);
        //webhookIO.postToSlack(msg);
        //process.exit(1);
    });


// Queue Management
//var jobQueueManager = require('./queues/jobQueueManager');
//jobQueueManager.processJobs();
