pragma solidity ^0.4.24;

import "./fixidity/ExponentLib.sol";
import "./fixidity/FixidityLib.sol";
import "./fixidity/LogarithmLib.sol";

/*
 * @title Bancor Adaptor
 * @dev Handles the transformation of a BancorFormula into a Polynomial
 * @notice Loses some precision
 */
contract BancorAdaptor {
    using ExponentLib   for FixidityLib.Fixidity;
    using FixidityLib   for FixidityLib.Fixidity;
    using LogarithmLib  for FixidityLib.Fixidity;

    FixidityLib.Fixidity public fixidity;

    uint24 public PPM;
    uint32 public reserveRatio;

    // Will have `precision` amount of decimal places
    int256 public exponent;

    // Will have `precision` amount of decimal places
    int256 public slope;

    constructor(
        uint32 _rr,
        uint8 _precision,
        uint256 _initialSupply,
        uint256 _initialReserve
    )   public 
    {
        PPM = 1000000;
        reserveRatio = _rr;
        fixidity.init(_precision);
        exponent = calculateExponent();
        slope = calculateSlope(_initialSupply, _initialReserve);
    }

    function calculateExponent() internal view returns (int256) {
        int256 nexp = fixidity.divide(int256(PPM), int256(reserveRatio));
        int256 expWPrecision = nexp - fixidity.fixed_1;
        require(
            expWPrecision > 0,
            "Calculating exponent failed"
        );
        return expWPrecision;
    }

    function calculateSlope(uint256 _s, uint256 _r) internal view returns (int256) {
        int256 s = int256(_s) * fixidity.fixed_1;
        int256 r = int256(_r) * fixidity.fixed_1;
        int256 nexp = fixidity.add(exponent, fixidity.fixed_1);
        int256 top = fixidity.multiply(r, nexp);
        int256 bottom = fixidity.power_any(s, nexp);
        int256 result = fixidity.divide(top, bottom);
        require(
            result > 0,  
            "Calculating slope failed"
        );
        return result;
    }

    function getPrecision() public view returns (uint8) {
        return fixidity.digits;
    }

    function integral(uint256 _toX) public view returns (int256) {
        int256 x = int256(_toX) * fixidity.fixed_1;
        int256 nexp = fixidity.add(exponent, fixidity.fixed_1);
        int256 result = fixidity.multiply(
            slope,
            fixidity.divide(
                fixidity.power_any(x, nexp),
                nexp
            )
        );
        require(
            result > 0,
            "Calculating integral failed"
        );
        return result;
    }
}
