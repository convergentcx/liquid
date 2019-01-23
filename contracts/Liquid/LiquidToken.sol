pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";
// import "openzeppelin-eth/contracts/ERC20/ERC20Detailed.sol";
import "zos-lib/contracts/Initializable.sol";

contract LiquidToken is Initializable, Ownable, ERC20 {
    address public drain = address(0xEEEE);

    function initialize() public initializer {
        Ownable.initialize(msg.sender);
    }

    function leaked() public view returns (uint128) {
        return uint128(balanceOf(drain));
    }

    /**
     * @dev condense() mints new Liquid Tokens 
     */
    function condense(address _to, uint256 _amount) public onlyOwner returns (bool) {
        _mint(_to, _amount);
        return true;
    }

    /**
     * @dev evap() burns Liquid Tokens 
     */
    function evap(address _from, uint256 _amount) public onlyOwner returns (bool) {
        _burn(_from, _amount);
        return true;
    }

    /**
     * @dev leak() send liquid tokens to drain
     */
    function leak(address _from, uint256 _amount) public onlyOwner returns (bool) {
        _burn(_from, _amount);
        _mint(drain, _amount);
        return true;
    }
}
