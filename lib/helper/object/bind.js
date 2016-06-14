'use strict';

const the = require('../the');
/**
 * @alias bind
 * @memberof app.helper.object
 * @description Bind read only properties to object or function.
 *
 * @param {object|function} target - Object or Function to bind property to.
 * @param {string} name - String property name.
 * @param {*} value - Value to set to the property name.
 */

function $bind(target, name, value) {
    // Ensure the target is an object or function and name is string.
    if (the(target).is([ 'object', 'function' ]) && 'string' === typeof name) {
        // Use .defineProperty to create read only property.
        Object.defineProperty(target, name, {
            enumerable: false,
            writable: false,
            value
        });
    }
}

function bind(name, value) {
    return $bind.call(this, this, name, value);
}

module.exports = { $bind, bind };
