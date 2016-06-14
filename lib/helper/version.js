'use strict';

const semver = require('semver');

/**
 * @namespace version
 * @memberof app.helper
 * @description Version helpers.
 */

/**
 * @memberof app.helper.version
 * @description Split raw version to detailed object.
 *
 * @param {string} rawVersion - String raw version to split the version. E.g: 'babel@~2.0.0/compile'
 * @returns {*}
 */
function split(rawVersion) {
    if ('string' !== typeof rawVersion) {
        throw new Error('Illegal Value: Split version require string as argument "rawVersion".');
    }

    // Get the version pattern from the raw version.
    let version = rawVersion.match(/\@[\d\.\~\>\<\=\^]+/);

    if (version) {
        // If version found, split the raw to get the name, version, and path.
        let splitted = rawVersion.split(version[ 0 ]);

        return {
            name: splitted[ 0 ],
            version: version[ 0 ].replace('@', ''),
            path: splitted[ 1 ].replace(/^[\/]/, '').replace(/[\/]+/g, '.')
        }
    } else {
        // If not found, split the raw to get the name and path, and use null as the version.
        let splitted = rawVersion.split('/');

        return {
            name: splitted[ 0 ],
            version: null,
            path: splitted.slice(1).join('.')
        }
    }
}

/**
 * @memberof app.helper.version
 * @description Match version from array versions.
 *
 * @param {array} sources - Array contain versions.
 * @param {string} target - String target version to match.
 * @returns {*}
 */
function match(sources, target) {
    if ('[object Array]' !== toString.call(sources) || 'string' !== typeof target) {
        throw new Error('Illegal Value: Version matching requires array version sources and string version target.');
    }

    // Create matched version.
    let version = semver.maxSatisfying(sources, target);

    // Return the matched version.
    return version;
}

/**
 * @memberof app.helper.version
 * @description the last version from the versions list.
 *
 * @param {array} sources - Array contain versions.
 * @returns {*}
 */
function latest(sources) {
    if ('[object Array]' !== toString.call(sources)) {
        throw new Error('Illegal Value: Getting latest version requires array as argument "soures".');
    }

    // Create version holder.
    let version;

    // Iterate the versions to get the higher version.
    sources.forEach(ver => {
        // If the version is undefined, use the current version.
        if (!version) {
            version = ver;
        } else {
            // Use the current version if greater than version.
            if (semver.gt(ver, version)) {
                version = ver;
            }
        }
    });

    // Return the version.
    return version;
}

// Exporting methods.
module.exports = { split, latest, match }
