'use strict';

const Config = require('./config');

const { split, match, latest } = require('./helper/version');
const { logger } = require('./helper/logger');
const { color } = logger;

class ConfigStore {
    /**
     * Configuration Store
     * @description Create new Configuration Store.
     *
     * @param {object} [props] - ConfigStore properties.
     * @constructor
     */
    constructor(name) {
        // Create default ConfigStore name.
        this.name = name || 'ConfigStore';

        // Create the Configs holder.
        this.configs = {};
    }

    /**
     * Config Setter
     * @description Add new config to the Configuration Store.
     *
     * @param {string} name - Configuration name.
     * @param {object} options - Configuration options.
     * @returns {*}
     */
    add(name, options = {}) {
        // Add single config if the name is string.
        if ('string' === typeof name) {
            logger.debug(`Registering config ${color.magenta(name)}...`).incIndent();

            // Creating config and version holder.
            let config, version;

            // Try to get the existing config if version defined on the options.
            if (options.version) {
                logger.debug(`Getting the existing config ${color.magenta(`${name}@${options.version}`)}...`);

                // Getting config from the store by adding config name and version as request.
                config = this.get(`${name}@${options.version}`);

                // Merge the existing config with the new one if already exist.
                if (config) {
                    logger.debug(`Existing config found. Merging the config datas...`);

                    config.merge(options);

                    // Return the merged config.
                    return config;
                } else {
                    logger.debug(`No existing config found. Getting the version from the request...`);

                    // Get the version number from the defined version.
                    let match = options.version.match(/[\d\.]+/g);

                    if (match) {
                        version = match[ 0 ];
                    }
                }
            }

            // Replate the given version with the parsed version.
            if (version) options.version = version;

            logger.debug(`Creating new config...`);

            // Creating new config if no config found on the system.
            if (!config) config = new Config(name, options);

            // Create new name space if not exist.
            if (!this.configs[ name ]) {
                this.configs[ name ] = {
                    [config.version]: config
                }
            }

            // Append to the existing name space if the version name already exist.
            else {
                // Re-check if the config if already exist.
                let cfg = this.configs[ name ][ config.version ];

                if (cfg) {
                    // If exist, merge it.
                    cfg.merge(options);

                    return cfg;
                } else {
                    // Create new one if not exist.
                    this.configs[ name ][ config.version ] = config;
                }
            }

            logger.decIndent().debug(`Config ${color.magenta(name)} registered.`);

            // Return the new service.
            return config;
        }

        return this;
    }

    /**
     * Config Getter
     * @description Get the configurations from the Configuration Store
     *
     * @param {string} name - Config name, with or without version. E.g: "http-config" or "http-config@~1.0.0"
     * @returns {*}
     */
    get(name) {
        if ('string' === typeof name) {
            logger.debug(`Finding config ${color.magenta(name)}...`).incIndent();

            // Split the name to get the config name, config version, and config path.
            let svc = split(name);

            // Continue to get the config if the config namespace exist on the store.
            if (this.configs[ svc.name ]) {
                // Creating version holder.
                let version;

                if (svc.version === null) {
                    logger.debug(`No version defined on the request. Getting the latest version...`);

                    // Get the latest version if no version on the request.
                    version = latest(Object.keys(this.configs[ svc.name ]));
                } else {
                    logger.debug(`Version defined on the request. Getting the matched version...`);

                    // Match the version if has version on the requst.
                    version = match(Object.keys(this.configs[ svc.name ]), svc.version);
                }

                logger.debug(`Matched version was ${color.yellow(version)}. Getting the config...`);

                // Getting the config.
                let config = this.configs[ svc.name ][ version ];

                if (svc.path) {
                    logger.decIndent().debug(`Config found. Returning the value of ${color.yellow(svc.path)} from the config.`);

                    // Get the specific path from the config if defined on the request.
                    return config.get(svc.path);
                } else {
                    logger.decIndent().debug(`Config found. Returning it.`);

                    // Return the full config if no specific path defined on the request.
                    return config;
                }
            } else {
                logger.decIndent();
            }
        }
    }
}

// Export the config store.
module.exports = ConfigStore;
