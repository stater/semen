/**
 * @namespace app
 * @description The main application namespace. This namespace will hold shared properties related to the Semen instance for factories.
 */

/**
 * @func start
 * @memberof app
 * @description Start one or more services. Starting services supports giving data. Services also can be started on sync or async mode.
 *
 * @param {string|array|function} services - Services to start. Use array contains string or function, or use function directly.
 * @param {object} [data] - Initial data to insert to the context storage.
 * @param {boolean} [async=true] - Does the services should be started in async mode.
 *
 * @returns {ServiceStore}
 */

/**
 * @func sync
 * @memberof app
 * @description Start services in sync mode. This method is a shorthand of [app.start]{@link app start}.
 *
 * @param {string|array|function} services - Services to start. Use array contains string or function, or use function directly.
 * @param {object} [data] - Initial data to insert to the context storage.
 *
 * @returns {ServiceStore}
 */

/**
 * @func async
 * @memberof app
 * @description Start services in async mode. This method is a shorthand of [app.start]{@link app start}.
 *
 * @param {string|array|function} services - Services to start. Use array contains string or function, or use function directly.
 * @param {object} [data] - Initial data to insert to the context storage.
 *
 * @returns {ServiceStore}
 */

/**
 * @namespace exports
 * @description Constructor context. The services and configs constructor should be exported in here.
 */

/**
 * @member service
 * @memberof exports
 * @description Service constructor definition. This object will be used to register new service.
 *
 * @property {string} name - Service name.
 * @property {object} options - Service options.
 * @property {string} [options.version=1.0.0] - Service version.
 */

/**
 * @member config
 * @memberof exports
 * @description Config constructor definition. This object will be used to register new config.
 *
 * @property {string} name - Config name.
 * @property {object} options - Config properties.
 */

'use strict';
