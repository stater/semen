'use strict';

const { $get } = require('./helper/object/get');
const { $set } = require('./helper/object/set');
const { $bind } = require('./helper/object/bind');
const { $list } = require('./helper/object/list');
const { $merge } = require('./helper/object/merge');

/**
 * Storage
 *
 * @param {object} datas - Object properties to write to the storage.
 * @constructor
 */
class Storage {
    constructor(data = {}) {
        // Storage data holder.
        this.data = {};

        // Makes the data private.
        Object.defineProperty(this, 'data', { enumerable: false });

        // Insert the given datas if defined.
        if ('[object Object]' === toString.call(data)) {
            Object.keys(data).forEach(key => {
                this.data[ key ] = data[ key ];
            });
        }
    }

    /**
     * Storage data getter.
     *
     * @param {string} path - String data path.
     * @param {*} [defValue] - Default value if the value is undefined.
     * @returns {*}
     */
    get(path, defValue) {
        return $get(this.data, path, defValue);
    }

    /**
     * Storage data setter.
     *
     * @param {string} path - String data path.
     * @param {*} value - Value to set to the path.
     * @returns {Storage}
     */
    set(path, value) {
        $set(this.data, path, value);

        return this;
    }

    /**
     * Read only data setter.
     *
     * @param {string} name - String data property name.
     * @param {*} value - Data property value.
     * @returns {Storage}
     */
    con(name, value) {
        $bind(this.data, name, value);

        return this;
    }

    /**
     * Convert the data to data paths.
     *
     * @returns {*}
     */
    list(exclude = true) {
        return $list(this.data, exclude);
    }

    /**
     * Merge one or more objects to the data path.
     *
     * @param {restparam} targets - Multiple arguments contains objects.
     * @returns {*}
     */
    merge(...targets) {
        return $merge(this.data, ...targets);
    }
}

// Export the Storage class.
module.exports = Storage;
