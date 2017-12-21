'use strict';
var getAllAttribut = function (elt) {
    var exp = '([a-z-]*)(?==)="([^"]*)"',
        re = new RegExp(exp, 'gi');
    var attr = {};
    var result = elt.match(re);
    if (!result) {
        return [];
    }
    result.forEach(element => {
        var eltAttr = attribut(element);
        attr[eltAttr[0]] = eltAttr[1]
    });
    return attr;
};

function attribut(element) {
    var exp = '([^=]*)="([^"]*)"',
        re = RegExp(exp, 'gi'),
        result = re.exec(element);
    return [result[1], result[2]];
}

var setAttribut = function (elt, attr) {

};

exports.getAllAttribut = getAllAttribut;
exports.setAttribut = setAttribut;