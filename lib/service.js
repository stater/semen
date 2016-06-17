'use strict';

const typeOf = require('jsmicro-typeof');
const foreach = require('jsmicro-foreach');
const factory = require('./helper/factory');
const apply = require('./helper/apply-class');
const the = require('./helper/the');

const { logger } = require('./helper/logger');
const { color } = logger;

const { $get } = require('./helper/object/get');
const { $merge } = require('./helper/object/merge');

/**
 * Service is a module to run single function or combination between function and another services.
 * @private
 */
class Service {
    /**
     * Service Constructor
     * @description Create new versioned Service.
     *
     * @param {String} name - Service name.
     * @param {Object} [options] - Service options.
     * @constructor
     */
    constructor(name, options = {}) {
        logger.assert('string' === typeof name, 'Invalid Assignment: Service name must be a string.');

        logger.debug(`Creating new service ${color.magenta(name)}...`).incIndent();

        // Register the object type.
        typeOf.add('Service', this);

        // Set the service name;
        this.name = name;

        // Create default values.
        this.version = '1.0.0';
        this.services = null;

        // Create service status.
        this.status = 'created';

        // Apply the given options.
        Object.keys(options).forEach(key => {
            logger.debug(`Applying options ${color.yellow(key)} to the service.`);

            this[ key ] = options[ key ];
        });

        logger.decIndent().debug(`Service ${color.magenta(name)} created.`);
    }

    /**
     * Service Handler Geter
     * @description Get the service handler function, or methods of service handler function.
     *
     * @param {String} [path] - Path of service methods. E.g: 'listen'.
     * @returns {*}
     */
    get(path) {
        if ('string' === typeof path) {
            if (the(this.services).is([ 'object', 'function' ])) {
                return $get(this.services, path);
            } else {
                return undefined;
            }
        } else {
            return this.services;
        }
    }

    /**
     * Service Initializer
     * @description Initialize the service to makes it ready to start. The initialzed service should return object or function.
     *
     * @returns {Service}
     */
    init() {
        // Get the store from this service.
        let { $main, $store } = this;

        logger.debug(`Getting the required config of ${color.magenta(this.name)}...`);

        // Get the configs and apply to this.
        this.configs = $main.configsStore.get(this.configs || `${this.name}-config@~${this.version}`) || {};

        // Initialize multiple services if the services is an array.
        if (Array.isArray(this.services)) {
            // Iterate the services to get the service and index number.
            this.services.forEach((service, i) => {
                // Initialize the service if the current service is a valid service.
                if ('string' === typeof service) {
                    let name = service;

                    // Get the required service from the store.
                    service = $store.get(name);

                    if (service) {
                        // Initalize it if not already initialized.
                        if (service.status === 'created') {
                            service.init();
                        }

                        // Replace the service with the initialized servie.
                        this.services[ i ] = service;
                    } else {
                        logger.error(new Error(`Invalid Service: Service ${color.magenta(name)} cannot be found!`));
                    }
                }

                // Initialize the function if the current service is a function.
                else if ('function' === typeof service && service.initialize) {
                    // Resolve the required params.
                    let params = this.resolve(service);

                    // Replace the service with the initialized function by giving the resolved params.
                    this.services[ i ] = apply(service, params);
                }
            });
        }

        // Initialize single service if the services is a function.
        else if ('function' === typeof this.services && this.services.initialize) {
            // Resolve the required params.
            let params = this.resolve(this.services);

            // Replace the services with the initialized function by giving the resolved params.
            this.services = apply(this.services, params);
        }

        // Set the service status to ready.
        this.status = 'ready';

        return this;
    }

    /**
     * Service Wrapper
     * @description Wrap the service to the given context. This method will allow services to runs on difference contexts.
     *
     * @param {Context} context - Context to bind to the service.
     * @returns {Service}
     */
    wrap(context) {
        // Cloning this service to make it as in-context service.
        let clone = Object.assign(new Service(''), this);

        // Bind the context to the cloned service.
        clone.context = context;

        // Wrap the child services to make them in-context as well.
        if (Array.isArray(this.services)) {
            // Iterate the services to wrap the child service.
            this.services.forEach((service, i) => {
                if ('service' === typeOf(service)) {
                    this.services[ i ] = service.wrap(context);
                }
            });
        }

        // Return the cloned services.
        return clone;
    }

    /**
     * Function Caller
     * @description Call the given function and give it the required params from the context.
     *
     * @param {function} fn - Function to call.
     * @returns {*}
     */
    call(fn) {
        // Ensure the given argument is a function.
        logger.assert('function' === typeof fn, 'Invalid Assignment: Service Call "fn" argument should be a function.');

        // Get the service context.
        let { context } = this;

        // Continue to call fi the service have a context.
        if (context) {
            // Resolve the params from the service context.
            let params = context.resolve(fn, this);

            // Apply the params to the function and return the function call result.
            return fn.apply(fn, params);
        }

        // Throw new error if the service doesn't have a context.
        else {
            logger.error(new Error('Invalid Context: Service call require context in the service it self.'));
        }
    }

    /**
     * Service Starter
     * @description Start the service. Service running mode is depend on the context.
     *
     * @returns {*}
     */
    start() {
        // Use assync call if the context is async.
        if (this.context.async) {
            return this.async();
        }

        // Use sync call if the context is not async.
        else {
            return this.sync();
        }
    }

    /**
     * Service Async Caller
     * @description Start the service in asynchronus mode.
     *
     * @returns {Service}
     */
    async() {
        if (this.status !== 'ready') {
            logger.error(new Error(`Illegal Start: Service ${color.magenta(this.name)} must be initialized before it can started!`));
        }

        // Start multiple services if the services is an array.
        if (Array.isArray(this.services)) {
            // Iterate the services to start them.
            this.services.forEach(service => {
                // Start the service if the current service is a valid service.
                if ('service' === typeOf(service)) {
                    service.start();
                } else {
                    // Call the function if the current service is a function.
                    if ('function' === typeof service) {
                        this.call(service);
                    }

                    // Get the handler function from the service if the current service is an object.
                    else if ('[object Object]' === toString.call(service)) {
                        // Get the handler only if the "handler" property is exist on the service.
                        if ('string' === typeof service.handler) {
                            // Get the handler function from the service.
                            let fn = $get(service, service.handler);

                            if ('function' === typeof fn) {
                                // If the handler found, call it.
                                this.call(fn);
                            } else {
                                logger.error(new Error(`Invalid Hanlder: The required handler ${color.magenta(service.handler)} from ${color.yellow(service.name)} is not a function or undefined.`));
                            }
                        } else {
                            logger.error(new Error(`Invalid Service: The service "${logger.color.yellow(service.name)}" doesn't have function to start.`));
                        }
                    }
                }
            });
        }

        // Start single service if the services is not an array.
        else {
            // Call this service if the type is function.
            if ('function' === typeof this.services) {
                this.call(this.services);
            }

            // Get the handler function if this.services is an object.
            else if ('[object Object]' === toString.call(this.services)) {
                // Get the hanlder only if the "handler" property is exist on the service.
                if ('string' === typeof this.handler) {
                    // Get the handler function from the service.
                    let fn = $get(this.services, this.handler);

                    if ('function' === typeof fn) {
                        // If the handler found, call it.
                        this.call(fn);
                    } else {
                        logger.error(new Error(`Invalid Hanlder: The required handler ${color.magenta(this.handler)} from ${color.yellow(this.name)} is not a function.`));
                    }
                } else {
                    logger.error(new Error(`Invalid Service: The service "${logger.color.yellow(this.name)}" doesn't have function to start.`));
                }
            }
        }

        return this;
    }

    /**
     * Sync Service Caller
     * @description Start services in synchronus mode.
     *
     * @returns {Promise}
     */
    sync() {
        if (this.status !== 'ready') {
            logger.error(new Error(`Illegal Start: Service ${color.magenta(this.name)} must be initialized before it can started!`));
        }

        // Sync mode call should return a promise, so the caller can wait for it to finish before starting the next service.
        return new Promise((resolve, reject) => {
            // Start multiple services if this.services is an array.
            if (Array.isArray(this.services)) {
                // Iterate the services to get the service.
                foreach(this.services).run((i, service, next) => {
                    // Create result holder.
                    let result;

                    if ('service' === typeOf(service)) {
                        // Start the direct service if the service is a valid Service.
                        result = service.start();
                    } else if ('function' === typeof service) {
                        // Call the function if the service is a function.
                        result = this.call(service);
                    } else if ('[object Object]' === toString.call(service)) {
                        // Get the handler function from the service if the service is an object.
                        if ('string' === typeof service.handler) {
                            let fn = $get(service, service.handler);

                            // Call the function if found.
                            if ('function' === typeof fn) {
                                result = this.call(fn);
                            } else {
                                logger.error(new Error(`Invalid Hanlder: The required handler ${color.magenta(service.handler)} from ${color.yellow(service.name)} is not a function.`));
                            }
                        } else {
                            logger.error(new Error(`Invalid Service: The service "${logger.color.yellow(service.name)}" doesn't have function to start.`));
                        }
                    }

                    if (result && result.then) {
                        // Wait for the service to finish if the result is a promise.
                        result.then(() => {
                            next();
                        });

                        // Reject the service if an error happened during the service call.
                        result.catch(err => {
                            reject(err);
                        });
                    } else {
                        // Start the next service if the result is not a promise.
                        next();
                    }
                }).then(() => {
                    resolve();
                });
            }

            // Use single service call if this.services is not an array.
            else {
                // Create the result holder.
                let result;

                if ('function' === typeof this.services) {
                    // Call the function if this.services is a function.
                    result = this.call(this.services);
                } else if ('[object Object]' === toString.call(this.services)) {
                    // Get the handler function from the service if this.services is an object.
                    if ('string' === typeof this.handler) {
                        // Get the handler function from the service.
                        let fn = $get(this.services, this.handler);

                        if ('function' === typeof fn) {
                            result = this.call(fn);
                        } else {
                            logger.error(new Error(`Invalid Hanlder: The required handler ${color.magenta(this.handler)} from ${color.yellow(this.name)} is not a function.`));
                        }
                    } else {
                        logger.error(new Error(`Invalid Service: The service "${logger.color.yellow(this.name)}" doesn't have function to start.`));
                    }
                }

                if (result && result.then) {
                    // Wait for the service to complete if the result is a promise.
                    result.then(()=> {
                        resolve();
                    });

                    // Reject the service if some error happened during the service call.
                    result.catch(err => {
                        reject(err);
                    });
                }

                // Mark it as complete if the result is not a promise.
                else {
                    resolve();
                }
            }
        });
    }

    /**
     * Resolve function arguments from the init context.
     *
     * @param {function} fn - Function to resolve the arguments.
     * @returns {Array}
     */
    resolve(fn) {
        let { $main } = this;
        let { Logger, logger } = $main.helper;

        let fc = factory(fn);
        let args = fc.args;

        // Create shared objects.
        let shared = {
            // Privately shared objects.
            $stater: $main,
            $serviceStore: $main.serviceStore,
            $configsStore: $main.configsStore,

            // Public objects.
            helper: $main.helper,
            logger: new Logger($merge({}, logger.cfg, { prefix: 'init' })),
            color: logger.color,

            // Config data only available on init scope.
            config: this.configs
        }

        // Get the params of function.
        let params = fc.parse([
            // Add the shared properties of Stater to the factory lookup.
            $get($main, [ 'sync', 'async', 'start' ]),

            // Add the shared objects to the factory lookup.
            shared,

            // Add the public properties of the service.
            $get(this, [ 'configs' ])
        ]);

        // Check for unresolved params.
        params.forEach((value, i) => {
            // Esnure to resolve the unresolved params.
            if ('undefined' === typeof value) {
                // Try to get the value from node_modules if value not found in service store.
                try {
                    // If module found, uset.
                    params[ i ] = require(args[ i ]);
                } catch (err) {
                    // Let it undefined if no module found.
                    return err;
                }
            }
        });

        return params;
    }
}

module.exports = Service;
