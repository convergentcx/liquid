const Account = artifacts.require('Account');
const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');
const DoubleCurveToken = artifacts.require('DoubleCurveToken');
const ConvergentBeta = artifacts.require('ConvergentBeta');
const GasPriceOracle = artifacts.require('GasPriceOracle');
const MockERC20 = artifacts.require('MockERC20');

const { expect } = require('chai');

const { fromWei, randomHex, toBN, toWei } = web3.utils;

const {
  getN,
  getM,
  toDecimal,
} = require('../lib/Util.js');

const Polynomial = require('../lib/Polynomial.js').default;

const exponent = toDecimal('1');
const slope = toDecimal('0.001');
const poly = new Polynomial(exponent, slope);

const vReserve = toDecimal('500000000000000');

const randomAddress = () => randomHex(20);
const randomBytes32 = () => randomHex(32);

const logGasDeploy = async (contract, name) => {
  // console.log(contract);
  const { transactionHash } = contract;
  if (!transactionHash) {
    throw new Error('Transaction hash not found on contract object');
  }
  const receipt = await web3.eth.getTransactionReceipt(transactionHash);
  console.log(
`
${name}
----------------
Deploy Gas - ${receipt.gasUsed}
`
  );
}

const logGasTx = (tx, name) => {
  console.log(
`
${name}
---------------
Tx Gas - ${tx.receipt.gasUsed}
`
  );
}

const findEventFromReceipt = (receipt, eventName) => (
  receipt.logs.find(log => log.event === eventName)
);


contract('ConvergentBeta', (accounts) => {
  let baseAccount, cvgBeta, gasPriceOracle, mERC20;

  before(async () => {
    gasPriceOracle = await GasPriceOracle.new();
    logGasDeploy(gasPriceOracle, "Gas Price Oracle");
    // For testing purposes set it really high for now
    await gasPriceOracle.initialize(toWei('500', 'ether'));

    mERC20 = await MockERC20.new(toWei('1000000', 'ether'));
    logGasDeploy(mERC20, "Mock ERC20");

    baseAccount = await Account.new();
    logGasDeploy(baseAccount, "Account");

    cvgBeta = await ConvergentBeta.new();
    logGasDeploy(cvgBeta, "Convergent Beta");
    const initTx = await cvgBeta.initialize(
      baseAccount.address,
      gasPriceOracle.address,
    );
    logGasTx(initTx, "ConvergentBeta::initialize()");
  });

  it('checks view functions', async () => {
    const retBaseAccount = await cvgBeta.baseAccount();
    expect(
      retBaseAccount
    ).to.equal(baseAccount.address);

    const retGPO = await cvgBeta.gasPriceOracle();
    expect(
      retGPO
    ).to.equal(gasPriceOracle.address);
  });

  it('only allows Owner() to set baseAccount', async () => {
    // We only want to check that it will be reverted or not
    // so we set the baseAccount to a random address, then change
    // it back.
    const rAddr = randomAddress();
    // console.log(rAddr)
    const setBaseAccountTx = await cvgBeta.setBaseAccount(
      rAddr,
      { from: accounts[0] },
    );
    logGasTx(setBaseAccountTx, "ConvergentBeta::setBaseAccount()");

    try {
      await cvgBeta.setBaseAccount(
        randomAddress(),
        { from: accounts[5] },
      );
    } catch (e) {
      // console.log(e);
      expect(e).to.exist;
    }

    const retBaseAccount = await cvgBeta.baseAccount();
    expect(
      retBaseAccount.toLowerCase()
    ).to.equal(rAddr.toLowerCase());

    // Return it to actual baseAccount implementation
    await cvgBeta.setBaseAccount(
      baseAccount.address,
      { from: accounts[0] },
    );
  });

  it('creates a new account', async () => {
    const randBytes = randomBytes32();

    const newAccountTx = await cvgBeta.newAccount(
      mERC20.address,
      "1",
      "1000",
      "1",
      "60",
      "100",
      "0",
      randBytes,
      "Logan",
      "FCK",
      { from: accounts[3] },
    );

    logGasTx(newAccountTx, "ConvergentBeta::newAccount()");
    
    // TODO - debug this
    // const metadataEvent = findEventFromReceipt(newAccountTx.receipt, "MetadataUpdated");
    // expect(
    //   metadataEvent.toLowerCase()
    // ).to.equal(randBytes);

    const newAccountEvent = findEventFromReceipt(newAccountTx.receipt, "NewAccount");
    const { account, creator } = newAccountEvent.args;
    expect(
      creator.toLowerCase()
    ).to.equal(accounts[3].toLowerCase());

    // Now test the account
    const acc = await Account.at(account);
    const retCretor = await acc.creator();
    expect(
      retCretor.toLowerCase()
    ).to.equal(accounts[3].toLowerCase());

    const retMetadata = await acc.metadata();
    expect(
      retMetadata
    ).to.equal(randBytes);

    const retServiceIndex = await acc.curServiceIndex();
    expect(
      retServiceIndex.toString()
    ).to.equal('0');

    const retCreator = await acc.creator();
    expect(
      retCreator.toLowerCase()
    ).to.equal(accounts[3].toLowerCase());

    const retName = await acc.name();
    expect(
      retName
    ).to.equal("Logan");

    const retSymbol = await acc.symbol();
    expect(
      retSymbol
    ).to.equal("FCK");

    const retRAsset = await acc.reserveAsset();
    expect(
      retRAsset.toLowerCase()
    ).to.equal(mERC20.address.toLowerCase());

    const retReserve = await acc.reserve();
    expect(
      retReserve.toString()
    ).to.equal("0");

    const retBeneficiary = await acc.beneficiary();
    expect(
      retBeneficiary.toLowerCase()
    ).to.equal(accounts[3].toLowerCase());

    const retContributions = await acc.contributions();
    expect(
      retContributions.toString()
    ).to.equal('0');

    const retSlopeN = await acc.slopeN();
    expect(
      retSlopeN.toString()
    ).to.equal("1");

    const retSlopeD = await acc.slopeD();
    expect(
      retSlopeD.toString()
    ).to.equal("1000")

    const retExponent = await acc.exponent();
    expect(
      retExponent.toString()
    ).to.equal("1")

    const retSpreadN = await acc.spreadN();
    expect(
      retSpreadN.toString()
    ).to.equal("60")

    const retSpreadD = await acc.spreadD();
    expect(
      retSpreadD.toString()
    ).to.equal("100")

  });

  it('Tries to update an account', async () => {
    const newAccountTx = await cvgBeta.newAccount(
      mERC20.address,
      "1",
      "1000",
      "1",
      "60",
      "100",
      "0",
      randomBytes32(),
      "Logan",
      "FCK",
      { from: accounts[3] },
    );

    // logGasTx(newAccountTx, "ConvergentBeta::newAccount()");
    
    // TODO - debug this
    // const metadataEvent = findEventFromReceipt(newAccountTx.receipt, "MetadataUpdated");
    // expect(
    //   metadataEvent.toLowerCase()
    // ).to.equal(randBytes);

    const newAccountEvent = findEventFromReceipt(newAccountTx.receipt, "NewAccount");
    const { account, creator } = newAccountEvent.args;
    expect(
      creator.toLowerCase()
    ).to.equal(accounts[3].toLowerCase());

    // Now test the account
    const acc = await Account.at(account);
    const impl = await cvgBeta.getImplementationForAccount(account);
    const baseAccount = await cvgBeta.baseAccount();
    expect(
      impl.toLowerCase()
    ).to.equal(baseAccount.toLowerCase());

    // Must upgrade to a contract address
    await cvgBeta.setBaseAccount(mERC20.address);
    await cvgBeta.upgradeAccount(acc.address, { from: accounts[3] });
    const impl2 = await cvgBeta.getImplementationForAccount(account);
    expect(
      impl2.toLowerCase()
    ).to.equal(mERC20.address.toLowerCase());

    // Disallows non-owner to update baseAccount
    try {
      await cvgBeta.setBaseAccount(baseAccount, { from: accounts[3] });
    } catch (e) {
      expect(e).to.exist;
    }

    await cvgBeta.setBaseAccount(baseAccount);

    // Disallows non-creator to update account
    try {
      // For now, even the admin is unable to upgrade
      await cvgBeta.upgradeAccount(acc.address, { from: accounts[0] });
    } catch (e) {
      expect(e).to.exist;
    }

    await cvgBeta.upgradeAccount(acc.address, { from: accounts[3] });
    const impl3 = await cvgBeta.getImplementationForAccount(acc.address);
    expect(
      impl3.toLowerCase()
    ).to.equal(baseAccount.toLowerCase());

    // Now just make sure something on account works
    const tx = await acc.addService(23, { from: accounts[3] });
    expect(tx.receipt.status).to.be.true;
  })
});
