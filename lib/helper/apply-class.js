'use strict';

/**
 * @alias apply
 * @memberof app.helper
 * @description Apply array arguments to class.
 *
 * @param {function} fn - Function or Class to receive the arguments.
 * @param {array} params - Array as arguments.
 */
function applyClass(fn, params) {
    if ('function' !== typeof fn) {
        throw new Error('Illegal Assignment: applyClass() "fn" argument should be a function.');
    }

    if ('[object Array]' !== toString.call(params)) {
        throw new Error('Illegal Assignment: applyClass() "params" argument should be an array.');
    }

    return new (Function.prototype.bind.apply(fn, [ null ].concat(params)));
}

module.exports = applyClass;
