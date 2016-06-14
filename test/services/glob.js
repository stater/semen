'use strict';

const glob = require('glob');
const path = require('path');

function GlobService(config, storage) {
    let cwd = storage.get('cwd');
    let rfl = storage.get('files');

    if (!Array.isArray(rfl)) {
        storage.set('files', []);
    }

    let found_files = [];

    storage.get('files').forEach(file_path => {
        let files = glob.sync(path.join(cwd || process.cwd(), file_path));

        if (files.length > 0) {
            found_files = found_files.concat(files);
        }
    });

    storage.set('files', found_files);

    console.log(storage.data);
}

module.exports.service = {
    name: 'ss-util-glob',
    version: '1.0.0',
    services: GlobService
}
