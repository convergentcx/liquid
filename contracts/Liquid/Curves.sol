pragma solidity ^0.4.24;

import "../Fixidity/ExponentLib.sol";
import "../Fixidity/FixidityLib.sol";
import "../Fixidity/LogarithmLib.sol";

import "./Polynomial.sol";

// contract IPriceFunction {
//     function integral   (uint256 v) external view returns (uint256);
//     function solveForX  (uint256 v) external view returns (uint256);
//     function Y          (uint256 v) external view returns (uint256);
// }

// contract BancorAdaptor is IPriceFunction, BancorFormula {
//     using ExponentLib   for FixidityLib.Fixidity;
//     using FixidityLib   for FixidityLib.Fixidity;
//     using LogarithmLib  for FixidityLib.Fixidity;

//     uint24 public constant PPM = 1000000;
//     uint24 public reserveRatio;

//     FixidityLib.Fixidity public fixidity;

//     constructor(
//         uint32 _reserveRatio,
//         uint8 _precision
//     )   public 
//     {
//         reserveRatio = _reserveRatio;
//         fixidity.init(_precision);
//     }

//     function integral(uint256 _X)
//         public view returns (uint256)
//     {
//         return calculatePurchaseReturn(
//             liquidToken.totalSupply(),
//             liquidityProvider.reserve(),
//             reserveRatio, 
//             _X - liquidToken.totalSupply()
//         );
//     }

//     function calculateSlope(
//         uint256 _supply
//         uint256 _reserve
//     )   public
//         view
//         returns (uint128)
//     {
//         int256 inverseRatio = fixidity.divide(int256(PPM), reserveRatio);
//         int256 numerator = fixidity.multiply(int256(_reserve), inverseRatio);
//         int256 denominator = fixidity.power_any(int256(_supply), inverseRatio);
//         int256 slopeWithPrecision = fixidity.divide(numerator, denominator);
//         assert(slopeWithPrecision >= 0);
//         return uint128(slopeWithPrecision);
//     }

//     function calculateExponent() public view returns (uint128) {
//         int256 stepOne = fixidity.divide(int256(PPM), reserveRatio);
//         int256 exponentWithPrecision = fixidity.subtract(stepOne, fixidity.fixed_1);
//         assert(exponentWithPrecision >= 0);
//         return uint128(exponentWithPrecision);
//     }

//     function Y(uint128 _X) public view returns (uint128) {
//         int256 result = fixidity.multiply(
//             int256(calculateSlope()),
//             fixidity.power_any(
//                 int256(_X),
//                 int256(calculateExponent())
//             )
//         );
//         assert(result >= 0);
//         return uint128(result);
//     }
// }

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
