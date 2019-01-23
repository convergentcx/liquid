pragma solidity ^0.4.24;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

import "./Account.sol";

contract ConvergentBeta {    
    event NEW_ACCOUNT(address account, address indexed creator);
    event NEW_VERSION(uint16[3] indexed semVer, bytes32 metadata, address packages);

    // These bases will themselves be proxies to allow
    // for easy upgrading.
    address public baseAccount;
    address public baseCurves;

    struct Version {
        uint16[3] semVer;
        bytes32 metadata;
        address packages;
    }

    uint16[3] public version;

    constructor(
        address _baseAccount,
        address _baseCurves
    )   public
    {
        baseAccount = _baseAccount;
        baseCurves  = _baseCurves;
        version = [0,0,1];
    }

    function newAccount(bytes32 _metadata) public returns (address) {
        bytes memory data = abi.encodeWithSignature("initialize(address,bytes32,address)", msg.sender, _metadata, baseCurves);
        Account account = Account(new AdminUpgradeabilityProxy(baseAccount, data));
        emit NEW_ACCOUNT(address(account), msg.sender);
        return address(account);
    }
}
