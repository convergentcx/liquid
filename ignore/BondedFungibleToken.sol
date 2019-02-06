pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "openzeppelin-eth/contracts/math/SafeMath.sol";
import "zos-lib/contracts/Initializable.sol";

import "./GasPriceOracle.sol";
import "./bancor-contracts/converter/BancorFormula.sol";

contract BFTEvents {
    event Bought(address indexed buyer, uint256 amount, uint256 paid);
    event Contributed(address indexed buyer, uint256 contribution);
    event Sold(address indexed seller, uint256 amount, uint256 reserveReturned);
}

contract BondedFungibleToken is Initializable, BFTEvents, Ownable, ERC20, ERC20Detailed {
    using SafeMath for uint256;

    // Parts per million
    uint24 public PPM;

    uint32 public reserveRatio;

    address public reserveAsset;
    uint256 public reserve;

    uint256 public virtualSupply;
    uint256 public virtualReserve;

    uint256 public heldContributions;

    BancorFormula public bancorFormula;

    uint256 public creatorPercentage;
    uint256 public cvgFee;

    address public gasPriceOracle;

    modifier validGasPrice {
        // Only if gasPriceOracle is set
        if (gasPriceOracle != address(0x0)) {
            uint256 gp = GasPriceOracle(gasPriceOracle).maxGasPrice();
            
            require(
                gp > 0,
                "Gasprice is zero - system has been paused"
            );

            require(
                tx.gasprice <= gp,
                "Gas price is too high"
            );
        }

        _;
    }

    function init(
        address _creator,
        string _name,
        string _symbol,
        address _rAsset,
        uint32 _rr,
        uint256 _vSupply,
        uint256 _vReserve,
        uint256 _creatorPercentage,
        address _bancorFormulaAddress,
        address _gasPriceOracle
    )   public
        initializer
    {
        ERC20Detailed.initialize(_name, _symbol, 18);
        Ownable.initialize(_creator);

        reserveAsset = _rAsset;
        reserveRatio = _rr;
        reserveAsset = _rAsset;
        virtualSupply = _vSupply;
        virtualReserve = _vReserve;
        creatorPercentage = _creatorPercentage;
        
        bancorFormula = BancorFormula(_bancorFormulaAddress);
        gasPriceOracle = _gasPriceOracle;

        cvgFee = 5;
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
        return bancorFormula.calculatePurchaseReturn(
            vSupply(),
            vReserve(),
            reserveRatio,
            _toSpend
        );
    }

    function sellReturn(uint256 _toSpend) public view returns (uint256) {
        return bancorFormula.calculateSaleReturn(
            vSupply(),
            vReserve(),
            reserveRatio,
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
        public payable validGasPrice returns (bool)
    {
        require(_toSpend > 0);

        if (reserveAsset == address(0x0)) {
            require(msg.value >= _toSpend);
        } else {
            require(msg.value == 0, "Tokens used as reserve not ether");

            uint256 userBalance = ERC20(reserveAsset).balanceOf(msg.sender);
            require(userBalance >= _toSpend);
            uint256 userApproved = ERC20(reserveAsset).allowance(msg.sender, address(this));
            require(userApproved >= _toSpend);

            bool reserveTransferred = ERC20(reserveAsset).transferFrom(msg.sender, address(this), _toSpend);
            require(reserveTransferred);
        }

        uint256 contribution = _toSpend * creatorPercentage / 100;
        uint256 spendingAmt = _toSpend.sub(contribution);
        uint256 tokensBought = purchaseReturn(spendingAmt);

        // If expected is set check that it hasn't slipped
        if (_expected > 0) {
            require(
                tokensBought >= (_expected.sub(_maxSlippage))
            );
        }

        heldContributions = heldContributions.add(contribution);
        reserve = reserve.add(spendingAmt);

        _mint(msg.sender, tokensBought);

        emit Bought(msg.sender, tokensBought, _toSpend);
        emit Contributed(msg.sender, contribution);

        return true;
    }

    function sell(uint256 _toSell, uint256 _expected, uint256 _maxSlippage)
        public validGasPrice returns (bool)
    {
        require(_toSell > 0, "Did not provide _toSell param");

        uint256 userBalance = balanceOf(msg.sender);
        require(
            userBalance >= _toSell,
            "User does not have enough balance"
        );

        uint256 reserveReturned = sellReturn(_toSell);
        uint256 cvgPercentage = reserveReturned * cvgFee / 100;

        if (_expected > 0) {
            require(
                reserveReturned >= _expected.sub(_maxSlippage)
            );
        }

        if (reserveReturned > reserve) {
            reserveReturned = reserve;
        }
        
        reserve = reserve.sub(reserveReturned);

        _burn(msg.sender, _toSell);

        if (reserveAsset == address(0x0)) {
            msg.sender.transfer(reserveReturned.sub(cvgPercentage));
            msg.sender.transfer(cvgPercentage);
        } else {
            bool transferred = ERC20(reserveAsset).transfer(msg.sender, reserveReturned.sub(cvgPercentage));
            bool transferredFee = ERC20(reserveAsset).transfer(msg.sender, cvgPercentage); 
            require(transferred && transferredFee);
        }

        emit Sold(msg.sender, _toSell, reserveReturned);
        return true;
    }

    function () payable { revert("Fallback disabled!"); }
}
