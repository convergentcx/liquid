pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "openzeppelin-eth/contracts/math/SafeMath.sol";
import "zos-lib/contracts/Initializable.sol";

import "./BancorAdaptor.sol";
import "./bancor-contracts/converter/BancorFormula.sol";

contract BFTEvents {
    event Bought(address indexed buyer, uint256 amount, uint256 paid);
    event Contributed(address indexed buyer, uint256 contribution);
    event Sold(address indexed seller, uint256 amount, uint256 reserveReturned);
}

contract BondedFungibleToken is Initializable, BFTEvents, Ownable, BancorFormula, ERC20, ERC20Detailed {
    using SafeMath for uint256;

    // Parts per million
    uint24 public PPM;

    uint32 public reserveRatioBuy;
    uint32 public reserveRatioSell;

    address public reserveAsset;
    uint256 public reserve;

    uint256 public virtualSupply;
    uint256 public virtualReserve;

    uint256 public heldContributions;

    BancorAdaptor public sellAdaptor;

    function init(
        address _creator,
        string _name,
        string _symbol,
        address _rAsset,
        uint32 _rrBuy,
        uint32 _rrSell,
        uint256 _vSupply,
        uint256 _vReserve
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

        sellAdaptor = new BancorAdaptor(_rrSell, 10, _vSupply, _vReserve);

        PPM = 1000000;
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

    function purchaseReturn(uint256 _toSpend) public view returns (uint256) {
        return calculatePurchaseReturn(
            vSupply(),
            vReserve(),
            reserveRatioBuy,
            _toSpend
        );
    }

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
            require(msg.value >= _toSpend);
            // TODO: handle the case of ether

        } else {
            uint256 userBalance = ERC20(reserveAsset).balanceOf(msg.sender);
            require(userBalance >= userBalance);
            uint256 userApproved = ERC20(reserveAsset).allowance(msg.sender, address(this));
            require(userApproved >= _toSpend);

            bool reserveTransferred = ERC20(reserveAsset).transferFrom(msg.sender, address(this), _toSpend);
            require(reserveTransferred);

            uint256 tokensBought = purchaseReturn(_toSpend);

            // If expected is set check that it hasn't slipped
            if (_expected > 0) {
                require(
                    tokensBought >= (_expected.sub(_maxSlippage))
                );
            }

            uint256 toReserve = calcReserveAmount(tokensBought);
            uint256 contribution = _toSpend.sub(toReserve);
            heldContributions = heldContributions.add(contribution);
            reserve = reserve.add(toReserve);

            _mint(msg.sender, tokensBought);

            emit Bought(msg.sender, tokensBought, _toSpend);
            // emit Contributed(msg.sender, contribution);

            return true;
        }
    }

    /**
     * @dev Syntax Sugar over the lower curve purchase amount 
     */
    function calcReserveAmount(uint256 _addedTokens)
        internal view returns (uint256)
    {
        int256 integralBefore = sellAdaptor.integral(vSupply());
        int256 integralAfter = sellAdaptor.integral(_addedTokens.add(vSupply()));
        int256 amount = integralAfter - integralBefore;
        require(
            amount > 0,
            "Failed to calculate reserve amount"
        );
        return uint256(amount);
    }

    function sell(uint256 _toSell, uint256 _expected, uint256 _maxSlippage)
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
