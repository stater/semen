'use strict';

const the = require('../the');
const foreach = require('jsmicro-foreach');

// Main Object Parser
function parse(path, maps, obj, exclude = false) {
    // Iterate the object to get the key and values.
    foreach(obj).run((key, value, next) => {
        // Save the last path.
        let last = path;

        // Create new path.
        let cpath = `${path}${(!path ? '' : '.')}${key}`;

        // Write the path and value to the maps if the value is not an array, object or arguments.
        if (the(value).isnot([ 'array', 'object', 'arguments' ])) {
            maps[ cpath ] = value;
        } else {
            // Write the path and value to the maps if the value is an array, object, or arguments and shouldn't to be excluded.
            if (!exclude) maps[ cpath ] = value;
        }

        // Parse the value if the value type is an array, object, or arguments.
        if (the(value).is([ 'array', 'object', 'arguments' ])) {
            // Overwrite the last path with new path before parsing the value.
            path = cpath;

            // Parse the value.
            parse(path, maps, value, exclude);

            // Restore the current path with the last path to prevent wrong path.
            path = last;
        }

        next();
    });
}

/**
 * @alias list
 * @memberof app.helper.object
 * @description List Object, Array, or Arguments paths.
 *
 * @param {object|array|arguments} target - Object, Array, or Arguments object.
 * @param {bollean} [exclude=false] - Does the Object, Array, or Arguments values should be excluded.
 * @returns {{}}
 */
function $list(target, exclude = false) {
    // Create new path and maps to save the parsed target.
    let path = '',
        maps = {};

    // Start parsing the target if the target is an array, object, or arguments.
    if (the(target).is([ 'array', 'object', 'arguments' ])) {
        parse(path, maps, target, exclude);
    }

    // Return the parsed target.
    return maps;
}

function list(exclude = false) {
    // Call the reader by applying this object.
    return $list.call(this, this, exclude);
}

// Exporting paths reader.
module.exports = { $list, list };
