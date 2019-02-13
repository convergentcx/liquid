pragma solidity 0.4.24;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/Initializable.sol";
import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

import "./Account.sol";


contract ConvergentBeta is Initializable, Ownable {    
    
    event NewAccount(address account, address indexed creator);

    address public baseAccount;
    address public gasPriceOracle;

    mapping (address => address) public accountToCreator;

    function initialize(
        address _baseAccount,
        address _gasPriceOracle
    )   public
        initializer
    {
        // tx.origin is used here due to an inconsistency in zos which
        //  uses the App.sol contract as `msg.sender`
        // solhint-disable-next-line avoid-tx-origin
        Ownable.initialize(tx.origin);

        baseAccount = _baseAccount;
        gasPriceOracle = _gasPriceOracle;
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
    function createAccount(
        address _reserveAsset,
        uint256 _slopeN,
        uint256 _slopeD,
        uint256 _exponent,
        uint256 _spreadN,
        uint256 _spreadD,
        uint256 _preMint,
        bytes32 _metadata,
        string _name,
        string _symbol
    )   public returns (address)
    {
        bytes memory data = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256,uint256,uint256,uint256,uint256,bytes32,string,string,address)",
            _reserveAsset,
            msg.sender,
            _slopeN,
            _slopeD,
            _exponent,
            _spreadN,
            _spreadD,
            _preMint,
            _metadata,
            _name,
            _symbol,
            gasPriceOracle
        );
        Account account = Account(new AdminUpgradeabilityProxy(baseAccount, data));
        emit NewAccount(address(account), msg.sender);
        accountToCreator[address(account)] = msg.sender;
        return address(account);
    }

    modifier onlyCreator(address _account) {
        require(
            msg.sender == accountToCreator[_account]
        );
        _;
    }

    function upgradeAccount(address _account) public onlyCreator(_account) returns (bool) {
        // This doesn't work becuase _account is a proxy
        // and this contract is the proxy admin, so it thinks
        // it's calling the fallback function.
    
        // address creator = Account(_account).creator();
        // require(
        //     (msg.sender == creator) || (msg.sender == owner()),
        //     "Only the creator of the account or Convergent Admin can upgrade an account"
        // );

        AdminUpgradeabilityProxy(_account).upgradeTo(baseAccount);
    }

    function getImplementationForAccount(address _account)
        public view returns (address)
    {
        return AdminUpgradeabilityProxy(_account).implementation();
    }
}
