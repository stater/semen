'use strict';

const the = require('../the');
const foreach = require('jsmicro-foreach');
const typeOf = require('jsmicro-typeof');
const { $list } = require('./list');
const { $set } = require('./set');

/**
 * @alias merge
 * @memberof app.helper.object
 * @description Merge two or more Object, Array and Arguments.
 *
 * @param {array|object|arguments} source - The source Object, Array, or Arguments to merge to.
 * @param {restparam} targets - Object, Array, or Arguments to merge to the source.
 * @returns {*}
 */
function $merge(source, ...targets) {
    // Only merge if the source type is array, object, or arguments.
    if (the(source).is([ 'array', 'object', 'arguments' ])) {
        // Create paths list for the source object.
        let spaths = $list(source);

        // Iterate the targets to get the target.
        foreach(targets, (i, target) => {
            // Only merge if the target type is equal to the source type.
            if (the(target).like(source)) {
                if ('storage' === typeOf(target)) target = target.data;

                // Create the target paths list.
                let tpaths = $list(target);

                // Iterate the target paths list to get the path and value.
                foreach(tpaths, (path, value) => {
                    // Check the value type if the current target is an array, object, or arguments.
                    if (the(value).is([ 'array', 'object', 'arguments' ])) {
                        // Set the new value to the source if the current source value type is different with the current target value.
                        if (the(spaths[ path ]).unlike(value)) {
                            $set(source, path, value);
                        }
                    } else {
                        // Set the new value to the source.
                        $set(source, path, value);
                    }
                });
            } else {
                throw new Error('Illegal Merging: Merging different object type is not allowed!');
            }
        });
    } else {
        throw new Error('Illegal Merging: Merging is only available for Array, Object, and Arguments');
    }

    // Return the merged source.
    return source;
}

function merge(...targets) {
    return $merge.apply(this, [ this, ...targets ]);
}

// Exporting methods.
module.exports = { $merge, merge };
