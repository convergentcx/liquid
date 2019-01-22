pragma solidity ^0.4.24;

import "./Polynomial.sol";

contract Curves {
    Polynomial public buyCurve;
    Polynomail public sellCurve;

    constructor(address _buyCurve, address _sellCurve) public {
        buyCurve = Polynomial(_buyCurve);
        sellCurve = Polynomail(_sellCurve);
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
}
