/**
 * FireTPL node.js/io.js extensions
 *
 * @module Node
 */
(function(FireTPL) {
    'use strict';

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

    /**
     * Compiles a file
     * @method compileFile
     * 
     * @param {String} template Template string or precompiled tempalte
     * @param {Object} options (Optional) Compiler options
     * 
     * @returns {String} Returns executed template
     */
    FireTPL.compileFile = function(file, options) {
        return FireTPL.compile(FireTPL.readFile(file), options);
    };

    /**
     * Synchronous read file function to read a file from file system.
     * @param  {string} file File path
     * @return {String}      Returns file content
     */
    FireTPL.readFile = function(file) {
        if (!fs.existsSync(file)) {
            throw new FireTPL.Error('Can not read file "' + file + '"! File was not found!');
        }

        return fs.readFileSync(file, { encoding: 'utf8'} );
    };
    
})(FireTPL);