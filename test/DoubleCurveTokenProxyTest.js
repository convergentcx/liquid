const truffleAssert = require('truffle-assertions');
const Account = artifacts.require('Account');
const ConvergentBeta = artifacts.require('ConvergentBeta');
const DoubleCurveToken = artifacts.require('DoubleCurveToken');
const GasPriceOracle = artifacts.require('GasPriceOracle');
const MockERC20 = artifacts.require('MockERC20');
const SafeMath = artifacts.require(
  'openzeppelin-eth/contracts/math/SafeMath.sol',
);
const Ownable = artifacts.require(
  'openzeppelin-eth/contracts/ownership/Ownable.sol',
);
const ERC20 = artifacts.require(
  'openzeppelin-eth/contracts/token/ERC20/ERC20.sol',
);
const ERC20Detailed = artifacts.require(
  'openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol',
);
const AddressUtils = artifacts.require(
  'openzeppelin-solidity/contracts/AddressUtils.sol',
);
const Initializable = artifacts.require('zos-lib/contracts/Initializable.sol');
const AdminUpgradeabilityProxy = artifacts.require(
  'zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol',
);
const UpgradeabilityProxy = artifacts.require(
  'zos-lib/contracts/upgradeability/UpgradeabilityProxy.sol',
);
const ProxyDoubleCurveToken = artifacts.require('ProxyDoubleCurveToken');

contract('contractProxyDoubleCurveToken', (accounts) => {
  let contractProxyDoubleCurveToken = null;
  let trace = false;
  let contractAddressUtils = null;
  let contractSafeMath = null;
  let contractOwnable = null;
  let contractInitializable = null;
  let contractERC20Detailed = null;
  let contractERC20 = null;
  let contractAdminUpgradeabilityProxy = null;
  let contractUpgradeabilityProxy = null;
  let contractConvergentBeta = null;
  let contractGasPriceOracle = null;
  let contractDoubleCurveToken = null;
  let contractAccount = null;
  let contractMockERC20 = null;
  beforeEach(async () => {
    contractAddressUtils = await AddressUtils.new({from: accounts[0]});
    contractSafeMath = await SafeMath.new({from: accounts[0]});
    contractOwnable = await Ownable.new({from: accounts[0]});
    contractInitializable = await Initializable.new({from: accounts[0]});
    ERC20.link('SafeMath', contractSafeMath.address);
    contractERC20 = await ERC20.new({from: accounts[0]});
    contractConvergentBeta = await ConvergentBeta.new({from: accounts[0]});
    contractGasPriceOracle = await GasPriceOracle.new({from: accounts[0]});
    DoubleCurveToken.link('SafeMath', contractSafeMath.address);
    contractDoubleCurveToken = await DoubleCurveToken.new({from: accounts[0]});
    contractAccount = await Account.new({from: accounts[0]});
    contractMockERC20 = await MockERC20.new(96, {from: accounts[7]});
    ProxyDoubleCurveToken.link('SafeMath', contractSafeMath.address);
    contractProxyDoubleCurveToken = await ProxyDoubleCurveToken.new({
      from: accounts[0],
    });
  });

  it('Should fail testsolveForY(uint256) when NOT comply with: slopeD > 0', async () => {
    await contractProxyDoubleCurveToken.methods[
      'initialize(address,address,uint256,uint256,uint256,uint256,uint256,uint256,string,string,address)'
    ](
      contractDoubleCurveToken.address,
      accounts[0],
      18,
      0,
      11,
      3,
      10001,
      17,
      'RevertWithReason',
      'bouncer',
      contractGasPriceOracle.address,
      {from: accounts[0]},
    );
    let result = await truffleAssert.fails(
      contractProxyDoubleCurveToken.testsolveForY(1337, {from: accounts[0]}),
      'revert',
    );
  });
});
