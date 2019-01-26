"use strict";
exports.__esModule = true;
var decimal_js_1 = require("decimal.js");
var assert = function (a, msg) {
    if (!!a === true) {
        return true;
    }
    throw new Error('Assertion ' + a + ' failed with message ' + msg);
};
var toDecimal = function (a) { return new decimal_js_1["default"](a); };
assert(toDecimal('0.5').toString() === '0.5');
// N is the exponent of the y = mx ^ n function.
var getN = function (rr, precision) {
    return precision.div(rr).minus(1);
};
assert(getN(toDecimal(500000), toDecimal(1000000)).toString() === '1');
// M is the slope, s is supply, r is reserve, rr = reserveRatio
var getM = function (s, r, rr, precision) {
    var n = getN(rr, precision);
    return r.mul(n.add(1))
        .div(s.pow(n.add(1)));
};
console.log(getM(toDecimal(100), toDecimal(5000), toDecimal(500000), toDecimal(1000000)).toString());
exports["default"] = {
    getN: getN,
    getM: getM,
    toDecimal: toDecimal
};
