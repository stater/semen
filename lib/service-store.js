'use strict';

const Service = require('./service');
const Context = require('./context');

const { $bind } = require('./helper/object/bind');
const { split, match, latest } = require('./helper/version');
const { logger } = require('./helper/logger');
const { color } = logger;
const typeOf = require('jsmicro-typeof');

class ServiceStore {
    /**
     * Service Store
     * @description Create new Service Store.
     *
     * @param {object} [props] - Service Store properties.
     * @constructor
     */
    constructor(props = {}) {
        // Create default ConfigStore name.
        this.name = 'ConfigStore';

        // Create the Services holder.
        this.services = {};

        // Assign the ConfigStore properties.
        if ('[object Object]' === toString.call(props)) {
            Object.keys(props).forEach(key => {
                if (key === '$main') {
                    Object.defineProperty(this, key, {
                        enumerable: false,
                        value: props[ key ]
                    });
                } else {
                    this[ key ] = props[ key ];
                }
            });
        }
    }

    /**
     * Service Setter
     * @description Add new service to the Service Store.
     *
     * @param {string} name - Service name.
     * @param {object} options - Service options.
     * @returns {Service}
     */
    add(name, options = {}) {
        // Registering single service if the name is string.
        if ('string' === typeof name) {
            logger.debug(`Registering service ${color.magenta(name)}...`).incIndent();

            // Creating new service.
            let service = new Service(name, options);

            // Binding the core objects to the service.
            $bind(service, '$main', this.$main);
            $bind(service, '$store', this);

            if (!this.services[ name ]) {
                logger.debug(`Namespace of ${color.magenta(name)} does not exist. Creating new namesapce including the service...`);

                // Create new namespace and add the service if not exist.
                this.services[ name ] = {
                    [service.version]: service
                }
            } else {
                logger.debug(`Namespace of ${color.magenta(name)} already exist. Appending the version ${color.yellow(service.version)}`);

                // Append new version to the namespace if namespace already exist.
                this.services[ name ][ service.version ] = service;
            }

            logger.decIndent().debug(`Service ${color.magenta(name)} registered.`);

            // Return the new service.
            return service;
        }
    }

    /**
     * Service Getter
     * @description Get service from the Service Store.
     *
     * @param {string} name - Service name, with or without version and path. E.g: "http-service" or "http-service@~1.0.0" or "http-service@1.0.0/listen"
     * @returns {*}
     */
    get(name) {
        logger.debug(`Finding service ${color.magenta(name)}...`).incIndent();

        // Split the request to get the name, version and path.
        let svc = split(name);

        // Continue to get the service if the namesapce exist.
        if (this.services[ svc.name ]) {
            // Create version holder.
            let version;

            if (svc.version === null) {
                logger.debug(`Version is not specified on the request. Getting the latest version.`);

                // Get the latest version if no version defined on the request.
                version = latest(Object.keys(this.services[ svc.name ]));
            } else {
                logger.debug(`Version is specified on the request. Getting the matched version...`);

                // Get the matched version if version defined on the request.
                version = match(Object.keys(this.services[ svc.name ]), svc.version);
            }

            logger.debug(`Matched version was ${color.yellow(version)}. Getting the service from Service Store...`);

            // Getting the service from the store.
            let service = this.services[ svc.name ][ version ];

            if (svc.path) {
                logger.decIndent().debug(`Service found: ${color.magenta(`${service.name}@${service.version}/${svc.path}`)}.`);

                // Get the path value from service if defined on the request.
                return service.get(svc.path);
            } else {
                logger.decIndent().debug(`Service found: ${color.magenta(`${service.name}@${service.version}`)}.`);

                // Return the service if no specific path defined on the request.
                return service;
            }
        }
    }

    /**
     * Service Initializer
     * @description Initialize the registered services, so they'll ready to start.
     *
     * @returns {ServiceStore}
     */
    init() {
        // Iterate the namespaces to get the versions.
        Object.keys(this.services).forEach(name => {
            // Iterate the versions to get the service object.
            Object.keys(this.services[ name ]).forEach(version => {
                // Getting the service object using the name and version.
                let service = this.services[ name ][ version ];

                // Ensure the service exist, has the init method, and not initialized.
                if (service && service.init && service.status !== 'ready') {
                    logger.debug(`Initializing service ${color.magenta(`${name}@${version}`)}...`).incIndent();

                    // If service found, initialize it.
                    service.init();

                    logger.decIndent().debug(`Service ${color.magenta(`${name}@${version}`)} initialized.`);
                }
            });
        });

        return this;
    }

    /**
     * Service Starter
     * @description Start one or more services with or without data, in syc or async mode.
     *
     * @param {string|array|function} services - Services to start.
     * @param {object} [initialData] - Initial data to share it with the services.
     * @param {boolean} [async=true] - Does the service should be started in async mode.
     * @returns {Context}
     */
    start(services, initialData = {}, async = true) {
        logger.debug(`Creating new context to start the services...`).incIndent();

        // Creating new context to start the services.
        let context = new Context(this.$main, this);

        // Apply the given storage data to the context.
        if ('[object Object]' === toString.call(initialData)) {
            logger.debug(`Applying the data to the context storage...`);

            // Merge the data to the storage if defined.
            if ('storage' === typeOf(initialData)) {
                context.storage.data = initialData.data;
            } else if ('object' === typeOf(initialData)) {
                context.storage.data = initialData;
            } else {
                context.storage.merge(initialData);
            }
        }

        // Inserting services to the context.

        // Use single insertion if the services is a string.
        if ('string' === typeof services) {
            logger.debug(`Inserting service ${color.magenta(services)} to the context...`);

            // Inserting the service to the context.
            context.insert(this.get(services));
        }

        // Use multiple insertion if the services is an array.
        else if (Array.isArray(services)) {
            services.forEach(service => {
                if ('string' === typeof service) {
                    logger.debug(`Inserting service ${color.magenta(service)} to the context...`);

                    // Inserting the service to the context.
                    context.insert(this.get(service));
                } else if ('function' === typeof service) {
                    logger.debug(`Inserting service ${color.magenta(service.name || 'unknown service')} to the context...`);

                    // Inserting v-service if the service is a function.
                    context.insert(service);
                }
            })
        }

        // Inserting v-service (function) if the services is a function.
        else if ('function' === typeof services) {
            logger.debug(`Inserting service ${color.magenta(services.name || 'unknown service')} to the context...`);

            // Insert the function to the context.
            context.insert(services);
        }

        logger.decIndent().debug(`Context created. Starting the context...`);

        // Start the context.
        return context.start(async);
    }

    /**
     * Sync Mode Service Start
     * @description Start services in synchronus mode.
     *
     * @param {string|array|function} services - Services to start.
     * @param {object} [data] - Initial data to share with the services.
     * @returns {Context}
     */
    sync(services, data = {}) {
        return this.start(services, data, false);
    }

    /**
     * Async Mode Service Start
     * @description Start services in asynchronus mode.
     *
     * @param {string|array|function} services - Services to start.
     * @param {object} [data] - Initial data to share with the services.
     * @returns {Context}
     */
    async(services, data = {}) {
        return this.start(services, data, true);
    }
}

module.exports = ServiceStore;
