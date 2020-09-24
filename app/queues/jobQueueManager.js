'use strict';

//
// jobQueueManager.js
// Manage analysis jobs
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

// App
var app = require('../app');
var tapisSettings = require('../config/tapisSettings');

// Models
var ServiceAccount = require('../models/serviceAccount');

// Processing
var tapisIO = require('../vendor/tapisIO');

// Node Libraries
var jsonApprover = require('json-approver');
var Q = require('q');
var kue = require('kue');
var taskQueue = kue.createQueue({
    redis: app.redisConfig,
});

var JobQueueManager = {};
module.exports = JobQueueManager;

JobQueueManager.processJobs = function() {

    /*
        Basic set of tasks

        1. Create archive path to hold job output
        2. Launch job w/ notification embedded
        3. When job is finished, perform any post-job tasks
    */

    taskQueue.process('createArchivePathDirectoryTask', function(task, done) {
        var jobData = task.data;

    });

    taskQueue.process('submitJobTask', function(task, done) {
        var jobData = task.data;

    });


    taskQueue.process('jobCompleteTask', function(task, done) {
        var jobData = task.data;

    });

};
