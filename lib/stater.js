'use strict';

// Including logger.
const { dirname } = require('path');
const glob = require('glob');

// Including dependencies.
const ServiceStore = require('./service-store');
const ConfigStore = require('./config-store');

const { logger } = require('./helper/logger');
const { color } = logger;

const { $bind } = require('./helper/object/bind');
const { normalize } = require('./helper/path');

/**
 * Stater Core Module
 *
 * @constructor
 */
class Stater {
    constructor() {
        // Set the app status to created.
        this.status = 'created';

        // Creating Service Store and Queue Store.
        this.serviceStore = new ServiceStore({ name: 'StaterServices' });
        this.configsStore = new ConfigStore({ name: 'StaterConfigs' });

        // Bind this as $main to the Service Store and Configs Store.
        [ 'serviceStore', 'configsStore' ].forEach(key => {
            $bind(this[ key ], '$main', this);
        });

        // Bind the helpers.
        this.helper = require('./helper');
    }

    /**
     * Service Bootstrapper
     * @description Load services into the app. Services can be local services or external services.
     *
     * @param {sring|array} paths - String path the service files (accepting glob matching), or array contains paths.
     * @returns {Stater}
     */
    bootstrap(paths) {
        if ('string' === typeof paths) {
            try {
                let mod_path = require.resolve(paths);

                logger.debug(`Bootstrapping ${color.yellow(paths)}...`).incIndent();

                try {
                    let { service, config } = require(mod_path);

                    if (service) {
                        if (Array.isArray(service)) {
                            service.forEach(svc => {
                                this.loadModule('service', svc);

                                if (svc.include) {
                                    this.include(svc.include, mod_path, svc);
                                }
                            });
                        } else if ('[object Object]' === toString.call(service)) {
                            this.loadModule('service', service);

                            if (service.include) {
                                this.include(service.include, mod_path, service);
                            }
                        }
                    }

                    if (config) {
                        if (Array.isArray(config)) {
                            config.forEach(cfg => {
                                this.loadModule('config', cfg);

                                if (cfg.include) {
                                    this.include(cfg.include, mod_path, cfg);
                                }
                            });
                        } else if ('[object Object]' === toString.call(config)) {
                            this.loadModule('config', config);

                            if (config.include) {
                                this.include(config.include, mod_path, config);
                            }
                        }
                    }
                } catch (err) {
                    logger.error(err);
                }

                logger.decIndent().debug(`Bootstrap of ${color.yellow(paths)} completed.`);
            } catch (err) {
                logger.debug(`Initializing bootstrap of ${color.yellow(paths)}...`);

                paths = normalize(paths);

                glob.sync(paths).forEach(file_path => {
                    this.bootstrap(file_path);
                });
            }
        } else if (Array.isArray(paths)) {
            paths.forEach(path => {
                this.bootstrap(path);
            });
        }

        // Set the app status to created.
        if (this.status !== 'bootstrapped') {
            this.status = 'bootstrapped';
        }

        return this;
    }

    /**
     * Module Loader
     * @description Load the modules so they can ready to register to the store.
     * @private
     *
     * @param {string} type - Module type (service|config).
     * @param {object} modul - The module object.
     * @returns {Stater}
     */
    loadModule(type, modul) {
        if (type === 'service') {
            let { name, services } = modul;

            logger.debug(`Loading service ${color.magenta(name)}...`).incIndent();

            if ('[object Object]' === toString.call(services)) {
                let { target } = services;

                if (target) {
                    target.require = services.require;
                    target.initialize = services.initialize;

                    modul.services = target;
                } else {
                    modul.services = undefined;
                }
            }

            this.serviceStore.add(name, modul);

            logger.decIndent().debug(`Service ${color.magenta(name)} loaded.`);
        } else if (type === 'config') {
            let { name } = modul;

            logger.debug(`Loading config ${color.magenta(name)}...`).incIndent();

            this.configsStore.add(name, modul);

            logger.decIndent().debug(`Config ${color.magenta(name)} loaded.`);
        }

        return this;
    }

    /**
     * Child Services Loader
     * @description Load child services and bootstrap them.
     * @private
     *
     * @param {string|array} paths - String service path, or array contains services.
     * @param {string} refpath - Path of the parent service.
     * @param {object} parent - The parent service.
     */
    include(paths, refpath, parent) {
        if ('string' === typeof paths) {
            logger.debug(`Including ${color.yellow(paths)} of ${color.green(parent.name)}...`).incIndent();

            try {
                let mod_path = require.resolve(paths);

                if (mod_path) {
                    this.bootstrap(mod_path);
                }
            } catch (err) {
                glob.sync(normalize(paths, dirname(refpath))).forEach(path => {
                    this.bootstrap(path);
                });
            }

            logger.decIndent().debug(`Including ${color.yellow(paths)} of ${color.green(parent.name)} completed.`);
        } else if (Array.isArray(paths)) {
            paths.forEach(path => {
                this.include(path, refpath, parent);
            });
        }

        return;
    }

    /**
     * Service Initializer
     * @description Initialize the registered services, so they're redy to be started.
     *
     * @returns {Stater}
     */
    initialize() {
        // Initialize the services.
        this.serviceStore.init();

        // Change the app status.
        if (this.status !== 'ready') {
            this.status = 'ready';
        }

        return this;
    }

    // SERVICE STORE METHODS.
    /**
     * Start one or more services. Starting services supports giving data. Services also can be started on sync or async mode.
     *
     * @param {string|array|function} services - Services to start. Use array contains string or function, or use function directly.
     * @param {object} [data] - Initial data to insert to the context storage.
     * @param {boolean} [async=true] - Does the services should be started in async mode.
     *
     * @returns {ServiceStore}
     */
    start(services, data, async = true) {
        return this.serviceStore.start(services, data, async);
    }

    /**
     * Start services in sync mode. This method is a shorthand of [app.start]{@link app start}.
     *
     * @param {string|array|function} services - Services to start. Use array contains string or function, or use function directly.
     * @param {object} [data] - Initial data to insert to the context storage.
     * @returns {*}
     */
    sync(services, data) {
        return this.serviceStore.start(services, data, false);
    }

    /**
     * Start services in async mode. This method is a shorthand of [app.start]{@link app start}.
     *
     * @param {string|array|function} services - Services to start. Use array contains string or function, or use function directly.
     * @param {object} [data] - Initial data to insert to the context storage.
     * @returns {*}
     */
    async(services, data) {
        return this.serviceStore.start(services, data, true);
    }

    /**
     * Config Getter
     * @description Get config from the Configuration Store.
     *
     * @param {string} name - Configuration name.
     * @returns {*}
     */
    getConfig(name) {
        return this.configsStore.get(name);
    }

    /**
     * Service Getter
     * @description Get service from the Service Store.
     *
     * @param {string} name - Service name.
     * @returns {*}
     */
    getService(name) {
        return this.serviceStore.get(name);
    }
}

// Exporting Stater.
module.exports = Stater;
