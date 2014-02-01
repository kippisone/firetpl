var express = require('express');
var app = express();
app.use(express.static(__dirname + '/examples'));

var port = 3222;
app.listen(3222);
console.log('Starting server on port', 3222);