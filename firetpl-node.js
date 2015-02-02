module.exports = (function() {
    'use strict';
    var FireTPL = {};
    FireTPL.Error = require('./src/firetpl-error')(FireTPL);
    FireTPL.Parser = require('./src/firetpl-parser')(FireTPL);
    return FireTPL;
})();