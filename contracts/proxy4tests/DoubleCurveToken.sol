import "../DoubleCurveToken.sol";

contract ProxyDoubleCurveToken  is DoubleCurveToken  {

       function testsolveForY(uint256  _x) public view returns (uint256 ){
    return solveForY(_x);
   }

   function testcurveIntegral(uint256  _toX) public view returns (uint256 ){
    return curveIntegral(_toX);
   }


}