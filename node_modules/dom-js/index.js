'use strict'
var dom = function (str) {
    this.txt = str;
};

dom.prototype.getElementByTagName = function (tagname) {
    var txt = this.txt;
    if (txt.indexOf('/' + tagname) !== -1) {
        var fin = '[^>]*>(?:.|\n|\r)*?<\/' + tagname + '>?';
    } else {
        fin = '[^>]*>?'
    }
    var exp = '<' + tagname + fin,
        re = new RegExp(exp, 'gi'),
        result = this.txt.match(re);
    return result;
};

dom.prototype.getElementByAttr = function (attr, val) {
    var txt = this.txt;
    // '<[^<>]* ?epub:type="pagebreak"[^>]*>((?:.|\n|\r)*?)<\/[^>]*>'
    // if (txt.indexOf('/' + tagname) !== -1) {
    //     var fin = '[^>]*>(?:.|\n|\r)*?<\/' + tagname + '>?';
    // } else {
    //     fin = '[^>]*>?'
    // }
    var exp = '<[^<>]* ?' + attr + '="' + val + '"[^>]*>((?:.|\n|\r)*?)<\/[^>]*>',
        re = new RegExp(exp, 'gi'),
        result = this.txt.match(re);
    return result;
};
module.exports = dom;