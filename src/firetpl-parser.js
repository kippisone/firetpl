/**
 * FireTPL parser
 *
 * @module  Parser
 */
module.exports = function() {
    'use strict';

    /**
     * Parser constructor
     *
     * @constructor
     *
     * @example (js)
     * var parser = new FireTPL.Parser();
     * parser.parse('input string');
     * var parsedStr = parser.flush();
     * 
     */
    var Parser = function() {

    };

    /**
     * Parses an input string
     * 
     * @param  {string} input Input string
     */
    Parser.prototype.parse = function(input) {
        
    };

    /**
     * Returns parsed data
     * 
     * @return {string} Returns parser result
     */
    Parser.prototype.flush = function() {
        
    };

    /**
     * Parse a tag
     * 
     * @private
     * @param  {string} tag Tag name
     */
    Parser.prototype.parseTag = function(tag) {
        
    };

    /**
     * Parse a closing tag
     * 
     * @private
     * @param  {string} tag Tag name
     */
    Parser.prototype.parseCloseTag = function(tag) {
        
    };

    /**
     * Parse a string
     * 
     * @private
     * @param  {string} string Tag name
     */
    Parser.prototype.parseString = function(string) {
        
    };

    /**
     * Parse a variable
     * 
     * @private
     * @param  {string} variable Tag name
     */
    Parser.prototype.parseVariable = function(variable) {
        
    };

    /**
     * Parse a helper
     * 
     * @private
     * @param  {string} helper Tag name
     */
    Parser.prototype.parseHelper = function(helper) {
        
    };

    /**
     * Parse a code block
     * 
     * @private
     * @param  {string} code block Tag name
     */
    Parser.prototype.parseCodeBlock = function(code) {
        
    };

    /**
     * Parse a attribute
     * 
     * @private
     * @param  {string} attribute Tag name
     */
    Parser.prototype.parseAttribute = function(attribute) {
        
    };

    /**
     * Creats a human readable error output
     *
     * Generates an error message and shows the area of code where the error has been occured.
     * Uses the this.pos property to determine the error position
     *
     * @private
     * @param {string} msg Error message
     */
    Parser.prototype.createError = function(msg) {
        
    };

    /**
     * Creates all patterns from pattern conf
     *
     * @private
     */
    Parser.prototype.matchBuilder = function() {
        
    };
};