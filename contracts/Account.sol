pragma solidity ^0.4.24;

import "zos-lib/contracts/Initializable.sol";
import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

import "./DoubleCurveToken.sol";

/**
 * @title Account
 * @dev   Manages the logic for user accounts on Convergent.
 */
contract Account is Initializable, DoubleCurveToken {
    event MetadataUpdated(bytes32 newMetadata);
    event ServiceRequested(address indexed requestor, uint8 indexed serviceIndex, string message);

    bytes32 public metadata;

    uint256 public curServiceIndex;
    // serviceIndex => servicePrice
    mapping (uint256 => uint256) public services;

    function initialize(
        address _reserveAsset,
        address _beneficiary,
        uint256 _slopeN,
        uint256 _slopeD,
        uint256 _exponent,
        uint256 _spreadN,
        uint256 _spreadD,
        uint256 _preMint,
        bytes32 _metadata,
        string _name,
        string _symbol
    )   initializer
        public
    {    
        DoubleCurveToken.initialize(
            _reserveAsset,
            _beneficiary,
            _slopeN,
            _slopeD,
            _exponent,
            _spreadN,
            _spreadD,
            _preMint,
            _name,
            _symbol
        );

        metadata = _metadata;
        emit MetadataUpdated(_metadata);
    }

    function addService(
        uint256 _price
    )   onlyCreator
        public
    {
        services[curServiceIndex] = _price;
        curServiceIndex = SafeMath.add(1, curServiceIndex);
    }

    function removeService(
        uint8 _serviceIndex
    )   public
        onlyCreator
    {
        require(
            services[_serviceIndex] != 0,
            "Service not initialized or already removed"
        );
        services[_serviceIndex] = 0;
    }

    function updateMetadata(
        bytes32 _metadata
    )   onlyCreator
        public
    {
        metadata = _metadata;

        emit MetadataUpdated(_metadata);
    }

    function requestService(
        uint8 _serviceIndex,
        string _message
    )   public
    {
        uint256 price = services[_serviceIndex];
        
        require(
            allowance(msg.sender, address(this)) >= price,
            "Must give this contract allowance first"
        );

        transferFrom(msg.sender, creator(), price);

        emit ServiceRequested(msg.sender, _serviceIndex, _message);
    }

    function proxy(address _target, bytes _data)
        public payable onlyCreator returns (bool)
    {
        return _target.call.value(msg.value)(_data);
    }

    function creator() public view returns (address) {
        return beneficiary;
    }

    modifier onlyCreator() {
        require(msg.sender == creator());
        _;
    }
}
