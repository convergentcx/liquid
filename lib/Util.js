"use strict";
exports.__esModule = true;
var decimal_js_1 = require("decimal.js");
var toDecimal = function (a) { return new decimal_js_1["default"](a); };
exports.toDecimal = toDecimal;
var reduceTokenDecimals = function (a) {
    var decimals = toDecimal(10).pow(toDecimal(18));
    return a.div(decimals);
};
exports.reduceTokenDecimals = reduceTokenDecimals;
// N is the exponent of the y = mx ^ n function.
var getN = function (rr, precision) {
    return precision.div(rr).minus(1);
};
exports.getN = getN;
// M is the slope, s is supply, r is reserve, rr = reserveRatio
var getM = function (s, r, rr, precision) {
    var n = getN(rr, precision);
    return r.mul(n.add(1)).mul(toDecimal(10).pow(toDecimal(18)))
        .div(s.pow(n.add(1)));
};
exports.getM = getM;
var getRR = function (n) {
    var ppm = toDecimal(1000000);
    return ppm.div(n.add(1));
};
exports.getRR = getRR;
