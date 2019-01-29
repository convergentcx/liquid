pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/Initializable.sol";

/// If maxGasPrice returns 0 no function will be able to 
/// succeed on Convergent Account contracts.
contract GasPriceOracle is Initializable, Ownable {
    uint256 public maxGasPrice;

    function initialize(
        uint256 _maxGasPrice
    )   public
        initializer
    {
        Ownable.initialize(msg.sender);
        maxGasPrice = _maxGasPrice;
    }

    function setGasPrice(uint256 _maxGasPrice)
        public onlyOwner returns (bool)
    {
        maxGasPrice = _maxGasPrice;
        return true;
    }

    function validateGasPrice(uint256 _gp) public view returns (bool) {
        return _gp <= maxGasPrice;
    }
}
