'use strict';

const the = require('../the');

/**
 * @alias get
 * @memberof app.helper.object
 * @description Get the value of object using dot (.) separated paths.
 *
 * @param {array|object|arguments|function} target - The target object to get the value from.
 * @param {string} path - The path to get the value.
 * @param {*} [defValue] - Default value if the value is undefined.
 * @returns {*}
 */
function $get(target, path, defValue) {
    if (the(target).isnot([ 'array', 'object', 'arguments', 'function' ])) return;

    if ('string' === typeof path) {
        /* Define current scope, paths list, result and done status */
        let current = target;
        let paths = path.split('.');

        let result, done;

        /* Iterate deeply until done */
        while (!done && paths.length > 0) {
            /* Define next object */
            let next = paths[ 0 ];

            if (paths.length <= 1) {
                /* Check last path and adding result if exist */
                if ('undefined' !== typeof current[ next ]) {
                    result = current[ next ];
                } else {
                    result = undefined;
                    done = true;
                }
            } else {
                /* Continue if next target is exist */
                if (the(current[ next ]).is([ 'object', 'array', 'arguments', 'function' ])) {
                    /* Update current scope */
                    current = current[ next ];
                }

                /* Escape in first not found */
                else {
                    result = undefined;
                    done = true;
                }
            }

            /* Define next path by slicing the paths list */
            paths = paths.slice(1);
        }

        /* Return default value if the given path is undefined, and the default value is defined */
        if ('undefined' === typeof result && 'undefined' !== typeof defValue) {
            return defValue;
        }

        /* Returning the result */
        return result;
    } else if (Array.isArray(path)) {
        let result = {};

        path.forEach(name => {
            result[ name ] = $get(target, name, defValue);
        });

        return result;
    }
}

function get(path, defValue) {
    return $get.call(this, this, path, defValue);
}

module.exports = { $get, get };
