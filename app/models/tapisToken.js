'use strict';

//
// tapisToken.js
// Tapis authentication token
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

var TapisToken = function(attributes) {
    this.token_type    = attributes.token_type || '';
    this.expires_in    = attributes.expires_in || '';
    this.refresh_token = attributes.refresh_token || '';
    this.access_token  = attributes.access_token  || '';
};

module.exports = TapisToken;
