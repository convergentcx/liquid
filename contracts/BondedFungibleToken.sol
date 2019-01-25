pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "openzeppelin-eth/contracts/math/SafeMath.sol";
import "zos-lib/contracts/Initializable.sol";

import "./bancor-contracts/converter/BancorFormula.sol";


contract BFTEvents {
    event Bought(address indexed buyer, uint256 amount, uint256 paid);
    event Contributed(address indexed buyer, uint256 contribution);
    event Sold(address indexed seller, uint256 amount, uint256 reserveReturned);
}

contract BondedFungibleToken is Initializable, BFTEvents, Ownable, BancorFormula, ERC20, ERC20Detailed {
    using SafeMath for uint256;

    // Parts per million
    uint24 public constant PPM = 1000000; // this is not allowed in upgradeable contracts because the proxy will not know the value of PPM

    uint32 public reserveRatioBuy;
    uint32 public reserveRatioSell;

    address public reserveAsset;
    uint256 public reserve;

    uint256 public virtualSupply;
    uint256 public virtualReserve;

    uint256 public heldContributions;

    function init(
        address _creator,
        string _name,
        string _symbol,
        address _rAsset,
        uint32 _rrBuy, // represented in parts per million (1-1000000) 
        uint32 _rrSell, // represented in parts per million (1-1000000)
        uint256 _vSupply, // what is this good for?
        uint256 _vReserve // what is this good for?
    )   public
        initializer
    {
        ERC20Detailed.initialize(_name, _symbol, 18);
        Ownable.initialize(_creator);

        reserveAsset = _rAsset;
        reserveRatioBuy = _rrBuy;
        reserveRatioSell = _rrSell;
        reserveAsset = _rAsset;
        virtualSupply = _vSupply;
        virtualReserve = _vReserve;
    }

    function sendContributions() public returns (bool) {
        if (reserveAsset == address(0x0)) {
            address(owner()).transfer(heldContributions);
            delete heldContributions;
        } else {
            ERC20(reserveAsset).transfer(owner(), heldContributions);
            delete heldContributions;
        }
        require(heldContributions == 0);
        return true;
    }

    // function cost() public view returns (uint256) {}

    // function payout() public view returns (uint256) {}

    // function currentBuy() public view returns (uint256) {}

    // function currentSell() public view returns (uint256) {}

    // function marketCap() public view returns (uint256) {}

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
            require(_toSpend <= userBalance); // should be smaller and can be equal!
            uint256 userApproved = ERC20(reserveAsset).allowance(msg.sender, address(this));
            require(userApproved >= _toSpend);

            bool reserveTransferred = ERC20(reserveAsset).transferFrom(msg.sender, address(this), _toSpend);
            require(reserveTransferred);

            // @dev: calculatePurchaseReturn causes an error when supply/reserve are 0! => setting them to 1 for now

            uint256 tokensBought = calculatePurchaseReturn(
                1,
                1,
                reserveRatioBuy,
                _toSpend
            );

            // If expected is set check that it hasn't slipped
            if (_expected > 0) {
                require(
                    tokensBought >= (_expected.sub(_maxSlippage))
                );
            }

            // calcReserveAdd uses calculatePurchaseReturn which is the wrong function..
            // this is the same error from before - we need a bit more steps to calculate the correct contribution amount

            uint256 toReserve = calcReserveAdd(_toSpend);  
            uint256 contribution = _toSpend.sub(toReserve);
            heldContributions = heldContributions.add(contribution);
            reserve = reserve.add(toReserve);

            _mint(msg.sender, tokensBought);

            emit Bought(msg.sender, tokensBought, _toSpend);
            emit Contributed(msg.sender, contribution);

            return true;
        }
    }

    /**
     * @dev Syntax Sugar over the lower curve purchase amount 
     */
    function calcReserveAdd(uint256 _toSpend) // calcReserveAmount is a confusing name
        internal view returns (uint256)
    {
        uint256 newTokens = calculatePurchaseReturn(
            1,
            1,
            reserveRatioBuy,
            _toSpend
        );

        return calculateSaleReturn(vSupply() + newTokens, 1, reserveRatioSell, newTokens);

    }

    function sell(uint256 _toSell) // this doesn't need expected & slippage
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

        _burn(msg.sender, _toSell);

        if (reserveAsset == address(0x0)) {
            // TODO handle case of ether
        } else {
            bool transferred = ERC20(reserveAsset).transfer(msg.sender, reserveReturned); 
            require(transferred);
        }

        emit Sold(msg.sender, _toSell, reserveReturned);
        return true;
    }
}
