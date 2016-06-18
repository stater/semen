'use strict';

const Semen = require('./../lib/semen');

let app = new Semen();

app.bootstrap('test/services/**/*.js');

app.initialize();

app.start('ss-util-glob', { files: [ 'core/**/*.js' ], cwd: process.cwd() });
