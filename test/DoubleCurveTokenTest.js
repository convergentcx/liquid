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

contract('DoubleCurveToken', (accounts) => {
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
    if (trace) console.log('SUCESSO: AddressUtils.new({from: accounts[0]}');
    contractSafeMath = await SafeMath.new({from: accounts[0]});
    if (trace) console.log('SUCESSO: SafeMath.new({from: accounts[0]}');
    contractOwnable = await Ownable.new({from: accounts[0]});
    if (trace) console.log('SUCESSO: Ownable.new({from: accounts[0]}');
    contractInitializable = await Initializable.new({from: accounts[0]});
    if (trace) console.log('SUCESSO: Initializable.new({from: accounts[0]}');
    ERC20.link('SafeMath', contractSafeMath.address);
    contractERC20 = await ERC20.new({from: accounts[0]});
    if (trace) console.log('SUCESSO: ERC20.new({from: accounts[0]}');
    contractConvergentBeta = await ConvergentBeta.new({from: accounts[0]});
    if (trace) console.log('SUCESSO: ConvergentBeta.new({from: accounts[0]}');
    contractGasPriceOracle = await GasPriceOracle.new({from: accounts[0]});
    if (trace) console.log('SUCESSO: GasPriceOracle.new({from: accounts[0]}');
    DoubleCurveToken.link('SafeMath', contractSafeMath.address);
    contractDoubleCurveToken = await DoubleCurveToken.new({from: accounts[0]});
    if (trace) console.log('SUCESSO: DoubleCurveToken.new({from: accounts[0]}');
    contractAccount = await Account.new({from: accounts[0]});
    if (trace) console.log('SUCESSO: Account.new({from: accounts[0]}');
    contractMockERC20 = await MockERC20.new(96, {from: accounts[7]});
    if (trace) console.log('SUCESSO: MockERC20.new(96,{from:accounts[7]}');
  });

  it('Should fail withdraw() when NOT comply with: contributions > 0', async () => {
    await contractDoubleCurveToken.methods[
      'initialize(address,address,uint256,uint256,uint256,uint256,uint256,uint256,string,string,address)'
    ](
      '0x0000000000000000000000000000000000000000',
      accounts[8],
      1337,
      2014223715,
      1,
      256,
      66,
      2014223715,
      'bouncer',
      'IsLibrary',
      contractGasPriceOracle.address,
      {from: accounts[0]},
    );
    await contractGasPriceOracle.methods['initialize(uint256)'](19, {
      from: accounts[0],
    });
    await contractDoubleCurveToken.buy(2014223715, 255, {
      from: accounts[0],
      gasPrice: 18,
    });
    let result = await truffleAssert.fails(
      contractDoubleCurveToken.withdraw({from: accounts[0]}),
      'revert',
    );
  });

  it('Should fail amountToReserve(uint256) when NOT comply with: spreadD > 0', async () => {
    await contractDoubleCurveToken.methods[
      'initialize(address,address,uint256,uint256,uint256,uint256,uint256,uint256,string,string,address)'
    ](
      contractDoubleCurveToken.address,
      accounts[0],
      97,
      9,
      255,
      4038714810,
      0,
      5,
      'bouncer',
      'Example',
      contractGasPriceOracle.address,
      {from: accounts[0]},
    );
    let result = await truffleAssert.fails(
      contractDoubleCurveToken.amountToReserve(4038714811, {from: accounts[0]}),
      'revert',
    );
  });
  it('Should fail currentPrice() when NOT comply with: slopeD > 0', async () => {
    await contractDoubleCurveToken.methods[
      'initialize(address,address,uint256,uint256,uint256,uint256,uint256,uint256,string,string,address)'
    ](
      contractAccount.address,
      accounts[4],
      95,
      0,
      10,
      1336,
      97,
      10000,
      'IsLibrary',
      '\x19Ethereum Signed Message:\n32',
      contractGasPriceOracle.address,
      {from: accounts[0]},
    );
    let result = await truffleAssert.fails(
      contractDoubleCurveToken.currentPrice({from: accounts[0]}),
      'revert',
    );
  });
});
