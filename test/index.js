'use strict';

const Stater = require('./../lib/stater');

let app = new Stater();

app.bootstrap('test/services/**/*.js');

app.initialize();

app.start('ss-util-glob', { files: [ 'core/**/*.js' ], cwd: process.cwd() });
