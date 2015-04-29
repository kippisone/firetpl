module.exports = function(dir) {
    'use strict';

    var path = require('path');

    var glob = require('glob').sync;

    var out = [],
        lastFile,
        curData;

    glob('**/*', {
        cwd: dir
    }).forEach(function(file) {
        var key = file.split('.');
        if (lastFile !== key[0]) {
            lastFile = key[0];
            curData = {};
            out.push(curData);
        }

        curData[key[1]] = path.join(dir, file);
    });

    return out;
};