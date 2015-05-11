/**
 * FireTPL i18n parser
 *
 * @module  i18nParser
 */
(function(FireTPL) {
    'use strict';

    /**
     * I18nParser constructor
     *
     * @constructor
     *
     * @example {js}
     * var parser = new FireTPL.Parser();
     * parser.parse('input string');
     * var parsedStr = parser.flush();
     *
     * Options:
     *
     * @arg eventTags {boolean}
     * Strip html event tags and add all into an `on` tag. The tag contains all event tags as a list seperated by a semicolon.
     * For example: `on="click:click-handler;mousedown:mouse-handler"`
     * 
     */
    var I18nParser = function(options) {
        this.lang = {};
    };

    I18nParser.prototype.add = function(lang, data) {
        this.flattn(data).forEach(function(item) {
            if (!this.lang[item[0]]) {
                this.lang[item[0]] = {};
            }

            this.lang[item[0]][lang] = item[1];
        }, this);
    };

    I18nParser.prototype.parse = function() {
        if (typeof this.lang !== 'object') {
            throw new FireTPL.ParseError('No i18n data found!');
        }

        var parseItem = function(val) {
            if (typeof val === 'string') {
                return '\'' + val + '\'';
            }
            else if (!val.key) {
                return '\'' + val.plur || val.sing + '\'';
            }
            else if (!val) {
                throw new FireTPL.ParseError('');
            }

            return 'data.' + val.key.replace(/^\$/, '') + '===1?\'' + val.sing + '\':\'' + val.plur + '\'';
        };

        var fn = 'var l=function(key,data,lang){var curLang=lang||FireTPL.i18nCurrent;switch(key){';

        for (var el in this.lang) {
            if (this.lang.hasOwnProperty(el)) {
                var item = this.lang[el];

                fn += 'case\'' + el + '\':switch(curLang){';
                
                for (var l in item) {
                    if (l === FireTPL.i18nDefault) {
                        continue;
                    }
                    if (item.hasOwnProperty(l)) {
                        var langItem = item[l];
                        
                        fn += 'case\'' + l + '\':return ' + parseItem(langItem) + ';';
                    }
                }                
                
                fn += 'default:return ' + parseItem(item[FireTPL.i18nDefault]) + ';}';
            }
        }

        fn += 'default:return FireTPL.i18nFallbackText;}};';
        return fn;
    };

    I18nParser.prototype.flattn = function(key, data) {
        if (arguments.length === 1) {
            data = key;
            key = '';
        }

        var values = [];
        for (var el in data) {
            if (data.hasOwnProperty(el)) {
                var item = data[el];
                
                if (typeof item === 'object') {
                    if (typeof item.sing === 'string' || typeof item.plur === 'string') {
                        values.push([key + el, item.key ? item : (item.plur || item.sing)]);
                    }
                    else {
                        values = values.concat(this.flattn(key + el + '.', item));
                    }
                }
                else {
                    values.push([key + el, item]);
                }
            }
        }


        return values;
    };

    FireTPL.I18nParser = I18nParser;
})(FireTPL);