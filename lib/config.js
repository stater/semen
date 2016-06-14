'use strict';

const Storage = require('./storage');

const { logger } = require('./helper/logger');
const { color } = logger;

class Config extends Storage {
    /**
     * Configuration Constructor
     * @description Create new versioned configuration.
     *
     * @param {string} name - Configuration name.
     * @param {object} [props] - Configuration properties.
     * @constructor
     */
    constructor(name, props = {}) {
        // Apply the storage constructor using props.configs if defined.
        super(props.configs || {});

        // Assign the config name.
        this.name = name;

        // Assign the config version.
        this.version = props.version || '1.0.0';

        logger.debug(`Config ${color.magenta(`${name}@${this.version}`)} created.`);
    }
}

// Export the coonfig constructor.
module.exports = Config;
