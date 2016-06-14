'use strict';

// Object helpers.
const { $get } = require('./object/get');
const { $set } = require('./object/set');
const { $list } = require('./object/list');
const { $merge } = require('./object/merge');
const { $bind } = require('./object/bind');

// Wrap the object helpers.
const object = { get: $get, set: $set, list: $list, merge: $merge, bind: $bind };

// Apply Class helper.
const apply = require('./apply-class');

// Version helper.
const version = require('./version');

// The helper
const the = require('./the');

// Factory helper
const factory = require('./factory');

// Unmet helper
const unmet = require('./unmet');

// Logger
const { logger, Logger } = require('./logger');

/**
 * @namespace helper
 * @memberof app
 * @description A collection of helper methods. All methods inside should be requested using fn.require = ['method', 'method'].
 *
 * @example
 * function testService(apply, get) {
 *   get({ a: { b: { c: 1 } } }, 'a.b.c'); // => 1
 * }
 *
 * testService.require = ['helper.apply', 'helper.object.get'];
 *
 * module.exports.service = { name: 'test', services: testService };
 */

/**
 * @namespace object
 * @memberof app.helper
 * @description A collection of Object helpers.
 */
let helpers = { object, the, factory, unmet, apply, version, logger, Logger };

// Exporting helpers.
module.exports = helpers;
