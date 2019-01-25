pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(uint256 _startingSupply) public {
        _mint(msg.sender, _startingSupply);
    }
}
