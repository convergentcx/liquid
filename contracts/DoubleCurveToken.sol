pragma solidity 0.4.24;

import "openzeppelin-eth/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "openzeppelin-eth/contracts/math/SafeMath.sol";
import "zos-lib/contracts/Initializable.sol";

import "./GasPriceOracle.sol";


contract CurveEvents {

    event Bought(address indexed buyer, uint256 amount, uint256 paid);
    event Contributed(address indexed buyer, uint256 contribution);
    event Sold(address indexed seller, uint256 amount, uint256 reserveReturned);
}


contract DoubleCurveToken is Initializable, CurveEvents, ERC20, ERC20Detailed {
    
    using SafeMath for uint256;

    function () external payable { revert("Fallback disabled"); }

    address public reserveAsset;
    uint256 public reserve;    // Amount held in contract to collaterize sells.

    address public beneficiary;
    uint256 public contributions;

    uint256 public slopeN;
    uint256 public slopeD;
    uint256 public exponent;
    uint256 public spreadN;    // Spread is actually only the area under the sell curve
    uint256 public spreadD;    //  represented as a fraction of the whole.

    // uint256 preMint;    // Pre-mint is used to start the token price at the desired point.

    address public gpo; // The gas price oracle

    function initialize(
        address _reserveAsset,
        address _beneficiary,
        uint256 _slopeN,
        uint256 _slopeD,
        uint256 _exponent,
        uint256 _spreadN,
        uint256 _spreadD,
        uint256 _preMint,
        string _name,
        string _symbol,
        address _gasPriceOracle
    )   public
        initializer
    {
        ERC20Detailed.initialize(_name, _symbol, 18);
        
        if (_preMint > 0) {
            _mint(address(0x1337), _preMint);
        }

        reserveAsset = _reserveAsset;
        beneficiary = _beneficiary;
        slopeN = _slopeN;
        slopeD = _slopeD;
        exponent = _exponent;
        spreadN = _spreadN;
        spreadD = _spreadD;
        gpo = _gasPriceOracle;
    }

    function withdraw() public returns (bool) {
        require(contributions > 0, "Cannot withdraw 0 amount");
        uint256 toSend = contributions;
        delete contributions;

        if (reserveAsset == address(0x0)) {
            beneficiary.transfer(toSend);
        } else {
            ERC20(reserveAsset).transfer(beneficiary, toSend);
        }
        return true;
    }

    function buy(uint256 _tokens, uint256 _maxSpend)
        public payable validateGasPrice returns (bool)
    {
        uint256 cost = priceToBuy(_tokens);
        // 
        require(
            cost <= _maxSpend
        );
        //
        uint256 reserveAmount = amountToReserve(_tokens);
        contributions = contributions.add(cost.sub(reserveAmount));
        reserve = reserve.add(reserveAmount);

        // Must mint tokens before value transfers in case of re-rentrancy.
        _mint(msg.sender, _tokens);

        // If Ether is the reserve send back the extra
        if (reserveAsset == address(0x0)) {
            if (msg.value > cost) {
                msg.sender.transfer(msg.value.sub(cost));
            }
        } else {
            // Otherwise try token transfer
            ERC20(reserveAsset).transferFrom(msg.sender, address(this), cost);
        }


        emit Contributed(msg.sender, cost.sub(reserveAmount));
        emit Bought(msg.sender, _tokens, cost);
    }

    function sell(uint256 _tokens, uint256 _minReturn)
        public validateGasPrice returns (bool)
    {
        require(
            balanceOf(msg.sender) >= _tokens
        );
        //
        uint256 amountReturned = returnForSell(_tokens);
        //
        require(
            amountReturned >= _minReturn
        );
        //
        reserve = reserve.sub(amountReturned);

        // Must burn tokens before state change in case of re-entrancy
        _burn(msg.sender, _tokens);

        if (reserveAsset == address(0x0)) {
            msg.sender.transfer(amountReturned);
        } else {
            ERC20(reserveAsset).transfer(msg.sender, amountReturned);
        }

        emit Sold(msg.sender, _tokens, amountReturned);
    }

    function priceToBuy(uint256 _tokens)
        public view returns (uint256)
    {
        return curveIntegral(totalSupply().add(_tokens)).sub(curveIntegral(totalSupply()));
    }

    function returnForSell(uint256 _tokens)
        public view returns (uint256)
    {
        return reserve.sub(
            spreadN.mul(
                curveIntegral(totalSupply().sub(_tokens))
            ).div(spreadD)
        );
    }

    function amountToReserve(uint256 _tokens)
        public view returns (uint256)
    {
        return spreadN.mul(
            curveIntegral(totalSupply().add(_tokens))
        ).div(spreadD).sub(reserve);
    }

    function currentPrice()
        public view returns (uint256)
    {
        return solveForY(totalSupply());
    }

    function marketCap()
        public view returns (uint256)
    {
        // Assumes 18 decimals
        return currentPrice().mul(totalSupply()).div(10**18);
    }

    function solveForY(uint256 _x)
        internal view returns (uint256)
    {
        return slopeN.mul(_x ** exponent).div(slopeD);
    }

    function curveIntegral(uint256 _toX)
        internal view returns (uint256)
    {
        uint256 nexp = exponent.add(1);

        // The below assumes we have 18 decimals on the token.
        return slopeN.mul(_toX ** nexp).div(nexp).div(slopeD).div(10**18);
    }

    modifier validateGasPrice {
        require(
            tx.gasprice <= GasPriceOracle(gpo).maxGas(),
            "Transaction gas price exceeds the oracle max gas."
        );
        require(
            GasPriceOracle(gpo).maxGas() > 0,
            "System has been shut down at the oracle."
        );
        _;
    }
}
