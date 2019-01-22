pragma solidity ^0.4.24;

import "zos-lib/contracts/Initializable.sol";

import "./Liquid/LiquidityProvider.sol";

// TODO
//  - add proxy function

/**
 * @title Account
 * @dev   Manages the logic for user accounts on Convergent.
 */
contract Account is Initializable {
    event METADATA_UPDATE (bytes newMetadata);
    event SERVICE_REQUEST (address indexed requestor, uint8 indexed serviceIndex, string message);

    address public creator;
    bytes32 public metadata;

    uint8 public curServiceIndex = 0;
    // serviceIndex => servicePrice
    mapping (uint8 => uint128) public services;

    LiquidityProvider public liquidityProvider;

    function initialize(
        address _creator,
        bytes32 _metadata
    )   initializer
        public
    {
        creator = _creator;
        metadata = _metadata;
        liquidityProvider = new LiquidityProvider();
        liquidityProvider.initialize()
    }

    // Probably not a robust upgradability solution
    function upgrade(address _liquidityProvider) public onlyCreator {
        delete liquidityProvider;
        liquidityProvider = _liquidityProvider;
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

        bool paid = liquidProvider.use(msg.sender, price);
        require(
            paid,
            "Tokens must have been paid from requestor"
        );

        emit SERVICE_REQUEST(msg.sender, _serviceIndex, _message);
    }

    modifier onlyCreator() {
        require(msg.sender == creator);
        _;
    }
}
