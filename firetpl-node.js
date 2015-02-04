module.exports = (function() {
    'use strict';
    var FireTPL = {};
    FireTPL.Error = require('./src/firetpl-error')(FireTPL);
    FireTPL.Parser = require('./src/firetpl-parser')(FireTPL);
    FireTPL.Compiler = require('./src/firetpl-compiler-node')(FireTPL);
    FireTPL.Runtime = require('./src/firetpl-runtime')(FireTPL);

    var fs = require('fs');
    
    FireTPL.__express = function(file, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        fs.readFile(file, { encoding: 'utf8' }, function(err, source) {
            if (err) {
                return callback(err);
            }

            var compiled = FireTPL.compile(source, options);
            return callback(null, compiled(options));
        });
    };
    
    return FireTPL;
})();