pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "openzeppelin-eth/contracts/ERC20/ERC20.sol";
// import "openzeppelin-eth/contracts/ERC20/ERC20Detailed.sol";
import "zos-lib/contracts/Initializable.sol";

import "./Curves.sol";
import "./LiquidToken.sol";

/**
 * @title LiquidProvider
 * Logic for providing liquidity to low volume tokens
 */
contract LiquidProvider is Initializable, Ownable {
    event LIQUID_BUY            (address indexed buyer, uint128 amount, uint128 paid);
    event LIQUID_CONTRIBUTION   (address indexed buyer, uint128 contribution);
    event LIQUID_SELL           (address indexed seller, uint128 amount, uint128 returnAmount);

    ERC20   public reserveAsset;
    uint128 public reserve;

    Curves public curves;

    uint256 public heldContributions;

    address public feeVault;
    uint256 public feeBuy = 1;  // 1% fee when buying.
    uint256 public feeSell = 2; // 2% fee when selling.

    LiquidToken public liquidToken;

    function initialize(address _curves) public initializer{
        Ownable.initialize(msg.sender);
        liquidToken = new LiquidToken();
        liquidToken.initialize();
        // The below doesn't feel right.
        curves = Curves(_curves);
    }

    // Function callable by any address which will send the contributions to
    // beneficiary.
    function grantContributions() public returns (bool) {
        bool transferSuccess = reserveAsset.transfer(owner(), heldContributions);
        delete heldContributions;
        require(
            transferSuccess,
            "Transfer must have succeeded"
        );
        return true;
    }

    function cost(uint128 _numTokens)
        public view returns (uint128)
    {
        uint128 totalSupply = liquidToken.totalSupply();
        uint128 oldIntegral = curves.buyCurveIntegral(totalSupply);
        uint128 newIntegral = curves.buyCurveIntegral(totalSupply.add(_numTokens));
        return newIntegral.sub(oldIntegral);
    }

    function payout(uint128 _numTokens)
        public view returns (uint128)
    {
        uint128 totalSupply = liquidToken.totalSupply();
        uint128 sellCurveIntegral = curves.sellCurveIntegral(totalSupply.sub(_numTokens));
        return reserve.sub(sellCurveIntegral);
    }

    function currentBuyPrice()
        public view returns (uint128)
    {
        uint128 totalSupply = liquidToken.totalSupply();
        return curves.buyCurveY(totalSupply);
    }

    function currentSellPrice()
        public view returns (uint128)
    {
        uint128 totalSupply = liquidToken.totalSupply();
        return curves.sellCurveY(totalSupply);
    }

    function marketCap()
        public view returns (uint128)
    {
        return liquidToken.totalSupply().mul(currentBuyPrice());
    }

    function buy(uint128 _numTokens)
        public 
    {
        require(
            _numTokens > 0,
            "Parameter `_numTokens` expected and not supplied"
        );

        uint128 toPay = cost(_numTokens);

        uint256 userFunds = reserveAsset.balanceOf(msg.sender);
        require(
            userFunds >= toPay,
            "User does not have enough funds to buy"
        );
        require(
            reserveAsset.approval(msg.sender, address(this)) >= toPay,
            "User has not approved this contract of the required funds"
        );

        bool transferSuccessful = reserveAsset.transferFrom(msg.sender, address(this), toPay);
        require(
            transferSuccessful,
            "The transfer of reserve asset failed"
        );

        uint128 addToReserve = amountToReserve(_numTokens);
        toClaim += toPay - addToReserve;
        reserve += addToReserve;

        bool mintSuccessful = liquidToken.condense(msg.sender, _numTokens);
        require(
            mintSuccessful,
            "The minting of new tokens failed"
        );

        emit LIQUID_BUY(msg.sender, _numTokens, toPay);
        emit LIQUID_CONTRIBUTION(msg.sender, contribution);
    }

    function amountToReserve(uint128 _numTokens)
        internal returns (uint128)
    {
        uint128 totalSupply = liquidToken.totalSupply();
        uint128 sellCurveIntegral = curves.sellCurveIntegral(totalSupply.add(_numTokens));
        return sellCurveIntegral.sub(reserve);
    }

    function sell(uint128 _numTokens)
        public 
    {
        require(
            _numTokens > 0,
            "Parameter `_numTokens` expected and not supplied"
        );

        uint128 userBalance = liquidToken.balanceOf(msg.sender);
        require(
            userBalance >= _numTokens,
            "User does not have enough tokens to sell"
        );

        uint128 returnAmount = payout(_numTokens);
        reserve -= returnAmount;

        bool burnSuccess = liquidToken.evap(msg.sender, _numTokens);
        require(
            burnSuccess,
            "The burning of user tokens failed"
        );

        reserveAsset.transfer(msg.sender, returnAmount);

        emit LIQUID_SELL(msg.sender, _numTokens, returnAmount);
    }

    function use(address _whoUses, uint256 _numTokens)
        public returns (bool)
    {
        require(
            (msg.sender == _whoUses) || (msg.sender == owner()),
            "Only you or owner can use tokens"
        );
        require(
            _numTokens > 0,
            "Parameter `_numTokens` expected and not supplied"
        );

        uint128 userBalance = liquidToken.balanceOf(_whoUses);
        require(
            userBalance >= _numTokens,
            "User balance too low"
        );

        uint256 intBefore = curves.sellCurveIntegral(liquidToken.leaked());
        require(liquidToken.leak(_whoUses, _numTokens));

        uint256 intAfter = curves.sellCurveIntegral(liquidToken.leaked());
        require(reserveAsset.transfer(owner(), intAfter - intBefore));

        return true;
    }
}
