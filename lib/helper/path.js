'use strict';

const { join } = require('path');

function normalize(path, cwd) {
    if (/^\//.test(path)) {
        return path;
    } else {
        return join(cwd || process.cwd(), path);
    }
}

module.exports = { normalize };
