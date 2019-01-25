pragma solidity ^0.4.24;

import "../Fixidity/ExponentLib.sol";
import "../Fixidity/FixidityLib.sol";
import "../Fixidity/LogarithmLib.sol";

contract Polynomial {
    using ExponentLib   for FixidityLib.Fixidity;
    using FixidityLib   for FixidityLib.Fixidity;
    using LogarithmLib  for FixidityLib.Fixidity;

    FixidityLib.Fixidity public fixidity;

    uint32 public expN;
    uint32 public expD;
    uint32 public slopeN;
    uint32 public slopeD;

    constructor(
        uint32 _expN,
        uint32 _expD,
        uint32 _slopeN,
        uint32 _slopeD
    )   public
    {
        expN = _expN;
        expD = _expD;
        slopeN = _slopeN;
        slopeD = _slopeD;
        fixidity.init(20);
    }

    function Y(uint128 _X) public view returns (uint128) {
        int256 exponent = fixidity.divide(
            int256(expN),
            int256(expD)
        );

        int256 slope = fixidity.divide(
            int256(slopeN),
            int256(slopeD)
        );
        
        int256 result = fixidity.multiply(
            slope,
            fixidity.power_any(int256(_X), exponent)
        );

        assert(result >= 0);

        return uint128(result);
    }

    function integral(uint128 _X) public view returns (uint128) {
        require(
            _X <= 340282366920938463463374607431768211455,
            "Too high `_X` value supplied - may cause overflow"
        );

        if (_X == 0) { return 0; }

        int256 exponent = fixidity.divide(
            int256(expN),
            int256(expD)
        );

        int256 slope = fixidity.divide(
            int256(slopeN),
            int256(slopeD)
        );

        int256 nextExponent = fixidity.add(
            exponent,
            fixidity.fixed_1
        );

        int256 result = fixidity.multiply(
            slope,
            fixidity.divide(
                fixidity.power_any(_X, nextExponent),
                nextExponent
            )
        );

        require(
            result >= 0,
            "Integral less than zero detected - CRITICAL"
        );
        
        return uint128(result); 
    }

    function solveForX(uint128 _integral) public view returns (uint128) {
        int256 exponent = fixidity.divide(
            int256(expN),
            int256(expD)
        );

        int256 slope = fixidity.divide(
            int256(slopeN),
            int256(slopeD)
        );

        int256 nextExponent = fixidity.add(
            exponent,
            fixidity.fixed_1
        );

        int256 stepOne = fixidity.divide(_integral, slope);
        int256 stepTwo = fixidity.multiply(stepOne, nextExponent);
        int256 stepThree = fixidity.power_any(
            stepTwo,
            fixidity.divide(fixidity.fixed_1, nextExponent)
        );

        assert(stepThree >= 0);
        
        return uint128(stepThree);
    }
}
