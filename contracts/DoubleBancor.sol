pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-eth/contracts/math/SafeMath.sol";
import "zos-lib/contracts/Initializable.sol";

import "./bancor-contracts/converter/BancorFormula.sol";

contract X is Initializable, BancorFormula, ERC20 {
    using SafeMath for uint256;

    // Parts per million
    uint24 public constant PPM = 1000000;

    uint256 public reserveRatioBuy;
    uint256 public reserveRatioSell;

    address public reserveAsset;
    uint256 public reserve;

    uint256 public virtualSupply;
    uint256 public virtualReserve;

    function initialize(
        _rrBuy,
        _rrSell,
        _rAsset
    )   public
        initializer
    {
        reserveRatioBuy = _rrBuy;
        reserveRatioSell = _rrSell;
        reserveAsset = _rAsset;
    }

    function cost() public view returns (uint256) {}

    function payout() public view returns (uint256) {}

    function currentBuy() public view returns (uint256) {}

    function currentSell() public view returns (uint256) {}

    function marketCap() public view returns (uint256) {}

    function vSupply() internal view returns (uint256) {
        return virtualSupply.add(totalSupply());
    }

    function vReserve() internal view returns (uint256) {
        return virtualReserve.add(reserve);
    }

    function buy(uint256 _toSpend, uint256 _expected, uint256 _maxSlippage)
        public returns (bool)
    {
        require(_toSpend > 0);

        if (reserveAsset == address(0x0)) {
            require(_toSpend >= msg.value);
            // TODO: handle the case of ether

        } else {
            uint256 userBalance = ERC20(reserveAsset).balanceOf(msg.sender);
            require(_toSprend > userBalance);
            uint256 userApproved = ERC20(reserveAsset).allowance(msg.sender, address(this));
            require(userApproved >= _toSpend);

            bool reserveTransferred = ERC20(reserveAsset).transferFrom(msg.sender, address(this), _toSpend);
            require(reserveTransferred);

            uint256 tokensBought = calculatePurchaseReturn(
                vSupply(),
                vReserve(),
                reserveRatioBuy,
                _toSpend
            );

            // If expected is set check that it hasn't slipped
            if (_expected > 0) {
                require(
                    tokensBought >= (_expected.sub(_maxSlippage))
                );
            }

            uint256 toReserve = calcReserveAmount(_toSpend);
            uint256 contribution = _toSpend.sub(toReserve);
            heldContributions = heldContributions.add(contribution);
            reserve = reserve.add(toReserve);

            bool tokensMinted = _mint(msg.sender, tokensBought);
            require(tokensMinted);

            emit BOUGHT(msg.sender, tokensBought, _toSpend);
            emit CONTRIBUTED(msg.sender, contribution);

            return true;
        }
    }

    /**
     * @dev Syntax Sugar over the lower curve purchase amount 
     */
    function calcReserveAmount(uint256 _toSpend)
        internal view returns (uint256)
    {
        return calculatePurchaseReturn(
            vSupply(),
            vReserve(),
            reserveRatioSell,
            _toSpend
        );
    }

    function sell(uint256 _toSell)
        public returns (bool)
    {
        require(_toSell > 0);

        uint256 userBalance = balanceOf(msg.sender);
        require(
            userBalance >= _toSell
        );

        uint256 reserveReturned = calculateSaleReturn(
            vSupply(),
            vReserve(),
            reserveRatioSell,
            _toSell
        );

        reserve = reserve.sub(reserveReturned);

        bool tokensBurned = _burn(msg.sender, _toSell);
        require(tokensBurned);

        if (reserveAsset == address(0x0)) {
            // TODO handle case of ether
        } else {
            bool transferred = ERC20(reserveAsset).transfer(msg.sender, reserveReturned); 
            require(transferred);
        }

        emit SOLD(msg.sender, _toSell, reserveReturned);
        return true;
    }

    // TODO use
    // Should use go to a communal pool in which we can issue
    // shares out of? That might be a good idea, thanks to 
    // Bentyn for it.
}
