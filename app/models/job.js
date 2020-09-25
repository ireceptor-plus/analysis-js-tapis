
'use strict';

//
// job.js
// Job model
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

function Job() {
}
module.exports = Job;

// Analysis mapping
var mapping = require('../config/mapping');

//
// Translate the analysis mapping into a Tapis job definition
//
Job.prototype.defineForAnalysis = function(analysis, data) {
    var m = mapping[analysis];
    if (!m) {
        console.error('IRPLUS-ANALYSIS-API ERROR: No analysis mapping for ' + analysis);
        return false;
    }

    // TODO: for now take the first one
    m = m[0];

    this['name'] = analysis;
    this['appId'] = m['app'];

    // translate inputs
    if (m['inputs']) {
        this['inputs'] = {};
        for (var input in m['inputs']) {
            if (((typeof m['inputs'][input]) == 'string') && (m['inputs'][input][0] == '$')) {
                // if first letter is $ then variable replace
                let name = m['inputs'][input].replace('$','');
                console.log(name);
                if (data[name]) this['inputs'][input] = data[name];
            } else {
                // else static copy
                this['inputs'][input] = m['inputs'][input];
            }
        }
    }

    // translate parameters
    if (m['parameters']) {
        this['parameters'] = {};
        for (var par in m['parameters']) {
            if (((typeof m['parameters'][par]) == 'string') && (m['parameters'][par][0] == '$')) {
                // if first letter is $ then variable replace
                let name = m['parameters'][par].replace('$','');
                console.log(name);
                if (data[name]) this['parameters'][par] = data[name];
            } else {
                // else static copy
                this['parameters'][par] = m['parameters'][par];
            }
        }
    }

    return true;
}

//
// Determine the execution level for the analysis
//
Job.prototype.defineExecutionLevel = function(analysis, data) {
    var m = mapping[analysis];
    if (!m) {
        console.error('IRPLUS-ANALYSIS-API ERROR: No analysis mapping for ' + analysis);
        return false;
    }

    // TODO: for now take the first one
    // TODO: we need to make sure the same one is pick as for defineForAnalysis
    m = m[0];

    // TODO: need logic here which determines the queue and
    // amount of resources to dedicate to the job.
    // batchQueue
    // maxRunTime
    // nodeCount
    
    // for now, just pick the first
    var levels = m['executionLevels'];
    var level = levels[0];
    
    this['batchQueue'] = level['batchQueue'];
    this['maxRunTime'] = level['maxRunTime'];
    this['nodeCount'] = level['nodeCount'];
    
    return true;
}
