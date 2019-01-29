"use strict";
exports.__esModule = true;
var Util_1 = require("./Util");
var Polynomial = /** @class */ (function () {
    function Polynomial(n, m) {
        this.exponent = n;
        this.slope = m;
    }
    /**
     * Solves for Y given an `x` value
     * @param x The x to solve for
     */
    Polynomial.prototype.y = function (x) {
        return this.slope.mul(x.pow(this.exponent));
    };
    /**
     * Solves for the integral given an `x` value
     * @param x The x to solve for
     */
    Polynomial.prototype.integral = function (x) {
        var nexp = this.exponent.add(1);
        return this.slope.mul((x.pow(nexp)).div(nexp));
    };
    /**
     * Solves for `x` value given and integral
     * @param integral The integral value to solve for
     */
    Polynomial.prototype.solveForX = function (integral) {
        var nexp = this.exponent.add(1);
        var stepOne = integral.div(this.slope);
        var stepTwo = stepOne.mul(nexp);
        var stepThree = stepTwo.pow(Util_1.toDecimal(1).div(nexp));
        return stepThree;
    };
    Polynomial.prototype.getVirtualParams = function (s) {
        var integral = this.integral(s);
        return {
            vSupply: s,
            vReserve: Util_1.reduceTokenDecimals(integral)
        };
    };
    Polynomial.fromBancorParams = function (s, r, rr, ppm) {
        var n = Util_1.getN(rr, ppm);
        var m = Util_1.getM(s, r, rr, ppm);
        return new Polynomial(n, m);
    };
    return Polynomial;
}());
;
exports["default"] = Polynomial;
