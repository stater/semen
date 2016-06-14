'use strict';

const typeOf = require('jsmicro-typeof');
const { $get } = require('./object/get');

// Define RegEx to parse the comments and arugments body.
const REGX_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg;
const REGX_ARGUMENT = /([^\s,]+)/g;

/**
 * Factory Constructor
 *
 * @param {function} fn - Function to create factory from.
 * @constructor
 */
class Factory {
    constructor(fn) {
        if ('function' === typeof fn) {
            this.fn = fn;
        }
    }

    /**
     * Arguments Getter
     *
     * @returns {Array}
     */
    get args() {
        if ('array' === typeOf(this.fn.require)) {
            return this.fn.require;
        } else {
            // Get the funciton string without comments.
            let fnStr = this.fn.toString().replace(REGX_COMMENTS, '');

            // Creating result.
            let result = fnStr
                .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
                .match(REGX_ARGUMENT);

            // Create empty array if result is null.
            if (result === null) {
                result = [];
            }

            // Return the result.
            return result;
        }
    }

    /**
     * Argument Values Getter
     *
     * @param {array|object} sources - Array or Object to find the required arguments from.
     * @returns {Array}
     */
    parse(sources, inmodule = false) {
        let result = [];
        let args = this.args;

        if (Array.isArray(sources)) {
            // Iterate the array objects to get the argument value from.
            sources.forEach(source => {
                // Iterate the arguments to check does the current object has the required name.
                args.forEach((key, i) => {
                    let value = $get(source, key);

                    if (value) {
                        result[ i ] = value;
                    } else {
                        if (!result[ i ]) result[ i ] = undefined;
                    }
                });
            });
        } else if ('[object Object]' === toString.call(sources)) {
            // Iterate the arguments to check does the given object has the required name.
            args.forEach((key, i) => {
                let value = $get(sources, key);

                if (value) {
                    result[ i ] = value;
                } else {
                    if (!result[ i ]) result[ i ] = undefined;
                }
            });
        }

        // Check for undefined result and try to load it using require()
        result.forEach((value, i) => {
            if ('undefined' === typeof value && inmodule) {
                try {
                    result[ i ] = require(args[ i ]);
                } catch (err) {
                    result[ i ] = undefined;
                }
            }
        });

        return result;
    }
}

/**
 * @memberof app.helper
 * @description Create a new factory to get function arguments or parse arguments values.
 *
 * @param {function} fn - Function to create factory from.
 * @returns {Factory}
 */
function factory(fn) {
    return new Factory(fn);
}

module.exports = factory;
