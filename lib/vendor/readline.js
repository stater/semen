/**
 * Read file line by line "synchronous"
 *
 * require nodejs ~0.11, run with "node --harmony"
 *
 * Example:
 *
 * var readLineSync = require('./readLineSync');
 *
 *
 * for( var i of readLineSync('test.txt', 'utf8') ) {
 *     console.info(i);
 * }
 *
 *
 * Author: Basem Mostafa, http://dbasem.com/
 * License: MIT
 */
'use strict';

let fs = require('fs'),
    os = require('os');

let EOL = os.EOL;

function getLine(buffer) {
    let i, end;

    for (i = 0; i < buffer.length; i++) {
        //detect end of line '\n'
        if (buffer[ i ] === 0x0a) {

            end = i;

            if (EOL.length > 1) {
                //account for windows '\r\n'
                end = i - 1;
            }

            return {
                line: buffer.slice(0, end).toString(),
                newBuffer: buffer.slice(i + 1)
            }
        }
    }

    return null;
}

module.exports = function* readLineSync(path, encoding) {
    /* eslint-disable no-cond-assign */
    let fsize,
        fd,
        chunkSize = 64 * 1024, //64KB
        bufferSize = chunkSize,
        remainder,
        curBuffer = new Buffer(0, encoding),
        readBuffer,
        numOfLoops;

    if (!fs.existsSync(path)) {
        throw new Error(`no such file or directory '${path}'`);
    }

    fsize = fs.statSync(path).size;

    if (fsize < chunkSize) {
        bufferSize = fsize;
    }

    numOfLoops = Math.floor(fsize / bufferSize);
    remainder = fsize % bufferSize;

    fd = fs.openSync(path, 'r');

    for (let i = 0; i < numOfLoops; i++) {
        readBuffer = new Buffer(bufferSize, encoding);

        fs.readSync(fd, readBuffer, 0, bufferSize, bufferSize * i);

        curBuffer = Buffer.concat([ curBuffer, readBuffer ], curBuffer.length + readBuffer.length);

        let lineObj;

        while (lineObj = getLine(curBuffer)) {
            curBuffer = lineObj.newBuffer;
            yield lineObj.line;
        }
    }

    if (remainder > 0) {
        readBuffer = new Buffer(remainder, encoding);

        fs.readSync(fd, readBuffer, 0, remainder, bufferSize * i);

        curBuffer = Buffer.concat([ curBuffer, readBuffer ], curBuffer.length + readBuffer.length);

        let lineObj;
        
        while (lineObj = getLine(curBuffer)) {
            curBuffer = lineObj.newBuffer;
            yield lineObj.line;
        }
    }

    //return last remainings in the buffer in case
    //it didn't have any more lines
    if (curBuffer.length) {
        yield curBuffer.toString();
    }
}
