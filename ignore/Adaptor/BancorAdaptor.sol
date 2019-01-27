pragma solidity ^0.4.24;

import "../bancor-contracts/converter/BancorFormula.sol";

contract BancorAdaptor is BancorFormula {
    using ExponentLib   for FixidityLib.Fixidity;
    using FixidityLib   for FixidityLib.Fixidity;
    using LogarithmLib  for FixidityLib.Fixidity;

    uint24 public constant PPM = 1000000;
    uint24 public reserveRatio;

    FixidityLib.Fixidity public fixidity;

    constructor(
        uint32 _reserveRatio,
        uint8 _precision
    )   public 
    {
        reserveRatio = _reserveRatio;
        fixidity.init(_precision);
    }

    function cost(uint256 forTokens)
        public view returns (uint256)
    {
        return calculatePurchaseReturn(
            liquidToken.totalSupply(),
            liquidityProvider.reserve(),
            reserveRatio, 
            forTokens - liquidToken.totalSupply()
        );
    }

    function calculateSlope(
        uint256 _supply
        uint256 _reserve
    )   public
        view
        returns (uint128)
    {
        int256 inverseRatio = fixidity.divide(int256(PPM), reserveRatio);
        int256 numerator = fixidity.multiply(int256(_reserve), inverseRatio);
        int256 denominator = fixidity.power_any(int256(_supply), inverseRatio);
        int256 slopeWithPrecision = fixidity.divide(numerator, denominator);
        assert(slopeWithPrecision >= 0);
        return uint128(slopeWithPrecision);
    }

    function getSlope ()
    {
        uint256 top = reserve.mul(rr.add(PPM)).div(PPM);
        uint256 bottom = supply ** (rr.add(PPM))l
    }

    function calculateExponent() public view returns (uint128) {
        int256 stepOne = fixidity.divide(int256(PPM), reserveRatio);
        int256 exponentWithPrecision = fixidity.subtract(stepOne, fixidity.fixed_1);
        assert(exponentWithPrecision >= 0);
        return uint128(exponentWithPrecision);
    }

    function Y(uint128 _X) public view returns (uint128) {
        int256 result = fixidity.multiply(
            int256(calculateSlope()),
            fixidity.power_any(
                int256(_X),
                int256(calculateExponent())
            )
        );
        assert(result >= 0);
        return uint128(result);
    }
}
