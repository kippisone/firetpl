(function(FireTPL) {
    'use strict';

    FireTPL.loadFile = function(src) {
        var content = '';

        if (typeof XMLHttpRequest === 'undefined') {
            console.warn('Don\'t use FireTPL.loadFile() on node.js');
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', src, false);
        xhr.send();


        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                content = xhr.responseText;
            }
            else if (xhr.status === 404) {
                console.error('Loading a FireTPL template failed! Template wasn\'t found!');
            }
            else {
                console.error('Loading a FireTPL template failed! Server response was: ' + xhr.status + ' ' + xhr.statusText);
            }
        }

        return content;
    };
})(FireTPL);