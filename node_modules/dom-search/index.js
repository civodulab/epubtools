'use strict';
module.exports = function (str, balise) {
    var exp = "<" + balise + " [^>]*>((?:.|\n|\r)*?)<\/" + balise + ">",
        re = new RegExp(exp, 'gi');
    return str.match(re);
};