pragma solidity ^0.4.24;

import "zos-lib/contracts/Initializable.sol";
import "./Liquid/LiquidityProvider.sol";

/**
 * @title Account
 * @dev   Manages the logic for user accounts on Convergent.
 */
contract Account is Initializable {
    event METADATA_UPDATE (bytes32 newMetadata);
    event SERVICE_REQUEST (address indexed requestor, uint8 indexed serviceIndex, string message);

    address public creator;
    bytes32 public metadata;

    LiquidityProvider public liquidityProvider;

    uint8 public curServiceIndex;
    // serviceIndex => servicePrice
    mapping (uint8 => uint128) public services;

    function initialize(
        address _creator,
        bytes32 _metadata,
        address _curves
    )   initializer
        public
    {
        creator = _creator;
        metadata = _metadata;
        liquidityProvider = new LiquidityProvider();
        liquidityProvider.initialize(
            _curves
        );

        emit METADATA_UPDATE(_metadata);
    }

    // Probably not a robust upgradability solution
    function upgrade(address _liquidityProvider) public onlyCreator {
        delete liquidityProvider;
        liquidityProvider = LiquidityProvider(_liquidityProvider);
    }

    function addService(
        uint128 _price
    )   onlyCreator
        public
    {
        services[curServiceIndex] = _price;
        curServiceIndex += 1;
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
        emit METADATA_UPDATE(_metadata);
    }

    function requestService(
        uint8 _serviceIndex,
        string _message
    )   public
    {
        uint128 price = services[_serviceIndex];

        bool paid = liquidityProvider.use(msg.sender, price);
        require(
            paid,
            "Tokens must have been paid from requestor"
        );

        // TODO transfer the tokens to creator

        emit SERVICE_REQUEST(msg.sender, _serviceIndex, _message);
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
