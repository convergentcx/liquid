pragma solidity 0.4.24;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/Initializable.sol";


/// If maxGasPrice returns 0 no function will be able to 
/// succeed on Convergent Account contracts.
contract GasPriceOracle is Initializable, Ownable {
    
    uint256 public maxGas;

    function initialize(
        uint256 _maxGas
    )   public
        initializer
    {
        // solhint-disable-next-line avoid-tx-origin
        Ownable.initialize(tx.origin);
        maxGas = _maxGas;
    }

    function setGasPrice(uint256 _maxGas)
        public onlyOwner returns (bool)
    {
        maxGas = _maxGas;
        return true;
    }
}
