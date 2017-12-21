'use strict';
module.exports = function (str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
};