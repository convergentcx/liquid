pragma solidity ^0.4.24;

import "./Polynomial.sol";

contract Curves {
    Polynomial public buyCurve;
    Polynomail public sellCurve;

    constructor(address _buyCurve) public {
        buyCurve = Polynomial(_buyCurve);
    }

    
}