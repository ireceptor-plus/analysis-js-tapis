'use strict';

//
// config.js
// Application configuration settings
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

var config = {};
module.exports = config;

var path = require('path');
var fs = require('fs');
var yaml = require('js-yaml');

var mapping = require('./mapping');
//console.log(mapping);

// General
config.port = process.env.ANALYSIS_API_PORT;

// Error/debug reporting
config.debug = process.env.DEBUG_CONSOLE;
if (config.debug == 'true') config.debug = true;
else if (config.debug == 1) config.debug = true;
else config.debug = false;

// get service info
var infoFile = path.resolve(__dirname, '../../package.json');
var infoString = fs.readFileSync(infoFile, 'utf8');
var info = JSON.parse(infoString);
config.info = {};
config.info.title = info.name;
config.info.description = info.description;
config.info.version = info.version;
config.info.contact = {};
config.info.contact.name = info.author;
config.info.contact.url = info.homepage;
config.info.license = {};
config.info.license.name = info.license;

// get api info
var apiFile = fs.readFileSync(path.resolve(__dirname, '../../specifications/analysis-api.yaml'), 'utf8');
var apiSpec = yaml.safeLoad(apiFile);
config.info.api = apiSpec['info'];
