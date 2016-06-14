'use strict';

const the = require('../the');

/**
 * @alias set
 * @memberof app.helper.object
 * @description Set value to the target object using path.
 *
 * @param {array|object|arguments|function} target - Target to set the value to.
 * @param {string} path - The value path.
 * @param {*} value - A value to set to the path.
 * @returns {target}
 */
function $set(target, path, value) {
    if (the(target).isnot([ 'array', 'object', 'arguments', 'function' ]) || 'string' !== typeof path) return this;

    /* Define current scope and paths list */
    let current = target;
    let paths = path.split('.');

    /* Iterate scopes until done */
    while (paths.length > 0) {
        /* Define next target */
        let next = paths[ 0 ];

        /* Apply the value if current path is the last path */
        if (paths.length <= 1) {
            current[ next ] = value;
            current = current[ next ];
        }

        /* Continue to iterate if still have next path */
        else {
            if (the(current[ next ]).is([ 'object', 'array', 'arguments', 'function' ])) {
                /* Use next scope if exist and updating current scope */
                current = current[ next ];
            } else {
                /* Create next scope if not exist and updating current scope */
                current[ next ] = {};
                current = current[ next ];
            }
        }

        /* Define next path by slicing paths list */
        paths = paths.slice(1);
    }

    /* Return the object it self */
    return this;
}

function set(path, value) {
    return $set.call(this, this, path, value);
}

module.exports = { $set, set };
