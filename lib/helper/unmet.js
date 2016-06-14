'use strict';

/**
 * @memberof app.helper
 * @description Check for unmet conditions without using [new].
 *
 * @param {boolean|boolean[]|{name:boolean}} cond - Boolean conditions, array contains boolean conditions, or object contains [key] as name
 * @returns {Unmet}
 */
function unmet(cond) {
    return new Unmet(cond);
}

module.exports = unmet;

/**
 * Check for unmet conditions and throw an error if unmet.
 *
 * @param {boolean|boolean[]|object} cond - Boolean condition, array contains boolean conditions, or object contains [key] as expected type, and :value as the value to compare the type.
 * @constructor
 */
class Unmet {
    constructor(cond) {
        // Set the meet to false by default.
        this.meet = false;

        // Create conditions list.
        this.cond = [];

        if ('boolean' === typeof cond) {
            // If the cond is a boolean, then use it as meet.
            this.meet = cond;
        } else if ('[object Array]' === toString.call(cond)) {
            // If the cond is an array, set the meet to true.
            this.meet = true;

            // Iterate the cond to get the meet status.
            cond.forEach((valid, idx) => {
                // Set the meet to false if one of the cond is invalid.
                if (valid === false) {
                    this.meet = false;

                    // Push the unmet cond to the this cond.
                    this.cond.push({ key: idx, value: valid });
                }
            });
        } else if ('[object Object]' === toString.call(cond)) {
            // If the cond is object, set the meet to true.
            this.meet = true;

            // Iterate the cond to get the meet status.
            Object.keys(cond).forEach(key => {
                // Set the meet to false if the cond is unmet.
                if (key !== toString.call(cond[ key ]).replace(/(\[object\s+)|(\])/g, '').toLowerCase()) {
                    this.meet = false;

                    // Push the unmet cond to this cond.
                    this.cond.push({ key, value: cond[ key ] });
                }
            });
        }

        return this;
    }

    /**
     * Throw error when the required conditions are unmet.
     *
     * @param {string|function} [msg] - String error message, or function to create an error message.
     */
    throw(msg) {
        if (!this.meet) {
            if ('function' === typeof msg) {
                throw new Error(msg.call(this, this.cond));
            } else if ('string' === typeof msg) {
                throw new Error(msg);
            } else {
                throw new Error(`Unmet Conditions: ${this.cond}`);
            }
        }
    }
}
