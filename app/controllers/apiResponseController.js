'use strict';

//
// apiResponseController.js
// Standard API responses
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

// Models
var ApiResponse = require('../models/apiResponse');

var ApiResponseController = {};
module.exports = ApiResponseController;

// Sends a 200 response with a success message to the client
ApiResponseController.sendSuccess = function(successResultMessage, response) {

    var apiResponse = new ApiResponse();
    apiResponse.setSuccess();
    apiResponse.result = successResultMessage;

    if (response) {
        response.status(200).send(apiResponse);
    }
};

// Sends a response with an error message to the client
ApiResponseController.sendError = function(errorMessage, errorCode, response) {

    var apiResponse = new ApiResponse();
    apiResponse.setError();
    apiResponse.message = errorMessage;

    if (response) {
        response.status(errorCode).send(apiResponse);
    }
};

ApiResponseController.confirmUpStatus = function(request, response) {
    ApiResponseController.sendSuccess('', response);
};
