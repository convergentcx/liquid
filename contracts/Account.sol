pragma solidity ^0.4.24;

import "zos-lib/contracts/Initializable.sol";
import "./BondedFungibleToken.sol";

/**
 * @title Account
 * @dev   Manages the logic for user accounts on Convergent.
 */
contract Account is Initializable {
    event MetadataUpdated(bytes32 newMetadata);
    event ServiceRequested(address indexed requestor, uint8 indexed serviceIndex, string message);

    address public creator;
    bytes32 public metadata;

    BondedFungibleToken public bft;

    uint256 public curServiceIndex;
    // serviceIndex => servicePrice
    mapping (uint256 => uint256) public services;

    function initialize(
        address _creator,
        bytes32 _metadata,
        string _name,
        string _symbol,
        address _rAsset,
        uint32 _rr,
        uint256 _vSupply,
        uint256 _vReserve,
        uint256 _creatorPercent,
        address _bancorFormulaAddress,
        address _gasPriceOracle
    )   initializer
        public
    {
        creator = _creator;
        metadata = _metadata;
        bft = BondedFungibleToken(new BondedFungibleToken());
        bft.init(
            _creator,
            _name,
            _symbol,
            _rAsset,
            _rr,
            _vSupply,
            _vReserve,
            _creatorPercent,
            _bancorFormulaAddress,
            _gasPriceOracle
        );

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
    )   onlyCreator
        public
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
            bft.allowance(msg.sender, address(this)) >= price,
            "Must give this contract allowance first"
        );

        bft.transferFrom(msg.sender, creator, price);

        emit ServiceRequested(msg.sender, _serviceIndex, _message);
    }

    function proxy(address _target, bytes _data)
        public payable onlyCreator returns (bool)
    {
        return _target.call.value(msg.value)(_data);
    }

    modifier onlyCreator() {
        require(msg.sender == creator);
        _;
    }
}
