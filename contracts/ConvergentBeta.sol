pragma solidity ^0.4.24;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/Initializable.sol";
import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

import "./Account.sol";

contract ConvergentBeta is Initializable, Ownable {    
    event NewAccount(address account, address indexed creator);

    address public baseAccount;
    // address public baseBFT;
    address public bancorFormula;
    address public gasPriceOracle;

    mapping (address => address) public accountToCreator;

    function initialize(
        address _baseAccount,
        // address _baseBFT,
        address _bf,
        address _gasPriceOracle
    )   public
        initializer
    {
        Ownable.initialize(tx.origin);

        baseAccount = _baseAccount;
        // baseBFT = _baseBFT;
        bancorFormula = _bf;
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
    
    // function setBaseBFT(address _newBaseBFT)
    //     public onlyOwner returns (bool)
    // {
    //     require(
    //         _newBaseBFT != address(0x0),
    //         "Expected parameter `_newBaseBFT`"
    //     );

    //     baseBFT = _newBaseBFT;
    //     return true;
    // }

    function setGasPriceOracle(address _gasPriceOracle)
        public onlyOwner returns (bool)
    {
        require(
            _gasPriceOracle != address(0x0),
            "Expected paramter `_gasPriceOracle`"
        );
        gasPriceOracle = _gasPriceOracle;
        return true;
    }

    /**
     * @dev Create a new account with ConvergentBeta proxy set as admin.
     * @param _metadata The content address of the metadata on IPFS.
     */
    function newAccount(
        bytes32 _metadata, 
        string _name, 
        string _symbol, 
        address _rAsset,
        uint32 _rr,
        uint256 _vSupply,
        uint256 _vReserve,
        uint256 _cPercent
    ) public returns (address) {
        bytes memory data = abi.encodeWithSignature(
            "initialize(address,bytes32,string,string,address,uint32,uint256,uint256,uint256,address,address)",
            msg.sender,
            _metadata,
            _name,
            _symbol,
            _rAsset,
            _rr,
            _vSupply,
            _vReserve,
            _cPercent,
            bancorFormula,
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
