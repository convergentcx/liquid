pragma solidity ^0.4.24;

import "../Fixidity/ExponentLib.sol";
import "../Fixidity/FixidityLib.sol";
import "../Fixidity/LogarithmLib.sol";

import "./Polynomial.sol";

contract Curves {
    Polynomial public buyCurve;
    Polynomial public sellCurve;

    constructor(address _buyCurve, address _sellCurve) public {
        buyCurve = Polynomial(_buyCurve);
        sellCurve = Polynomial(_sellCurve);
    }

    function buyCurveIntegral(uint128 _X)
        public view returns (uint128)
    {
        return uint128(buyCurve.integral(_X));
    }

    function sellCurveIntegral(uint128 _X)
        public view returns (uint128)
    {
        if (address(sellCurve) != address(0x0)) {
            return uint128(sellCurve.integral(_X));
        }
        return buyCurveIntegral(_X);
    }

    function buyCurveY(uint128 _X)
        public view returns (uint128)
    {
        return uint128(buyCurve.Y(_X));
    }

    function sellCurveY(uint128 _X)
        public view returns (uint128)
    {
        if (address(sellCurve) != address(0x0)) {
            return uint128(sellCurve.Y(_X));
        }
        return uint128(buyCurveY(_X));
    }

    function buyCurveSolveX(uint128 _integral)
        public view returns (uint128)
    {
        return (uint128(buyCurve.solveForX(_integral)));
    }
}
