'use strict';

//
// apiResponse.js
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

var ApiResponse = {};

ApiResponse.schema = function() {
    this.message = '';
    this.result  = '';
    this.status  = '';
};

ApiResponse.schema.prototype.setSuccess = function() {
    this.message = '';
    this.status  = 'success';
};

ApiResponse.schema.prototype.setError = function() {
    this.message = '';
    this.status  = 'error';
};

module.exports = ApiResponse.schema;
