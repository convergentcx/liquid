pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/Initializable.sol";
import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

import "./Account.sol";

contract ConvergentBeta is Initializable, Ownable {    
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

    function initialize(
        address _baseAccount,
        address _baseCurves
    )   public
        initializer
    {
        baseAccount = _baseAccount;
        baseCurves  = _baseCurves;
        version = [0,0,1];
    }

    function setBaseAccount(address _newBaseAccount)
        public onlyOwner returns (bool) 
    {
        require(
            _newBaseAccount != address(0x0),
            "Expected parameter `_newBaseAccount` but it was not supplied"
        );

        baseAccount = _newBaseAccount;
        return true;
    }

    /**
     * @dev Create a new account with ConvergentBeta proxy set as admin.
     * @param _metadata The content address of the metadata on IPFS.
     */
    function newAccount(bytes32 _metadata) public returns (address) {
        bytes memory data = abi.encodeWithSignature("initialize(address,bytes32,address)", msg.sender, _metadata, baseCurves);
        Account account = Account(new AdminUpgradeabilityProxy(baseAccount, data));
        emit NEW_ACCOUNT(address(account), msg.sender);
        return address(account);
    }

    function upgradeAccount(address _account) public returns (bool) {
        address creator = Account(_account).creator();
        require(
            (msg.sender == creator) || (msg.sender == owner()),
            "Only the creator of the account or Convergent Admin can upgrade an account"
        );

        AdminUpgradeabilityProxy(_account).upgradeTo(baseAccount);
    }
}
