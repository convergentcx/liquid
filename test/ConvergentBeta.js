const Account = artifacts.require('Account');
const BancorFormula = artifacts.require('BancorFormula');
const BondedFungibleToken = artifacts.require('BondedFungibleToken');
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
  let bancorFormula, baseAccount, cvgBeta, gasPriceOracle, mERC20;

  before(async () => {
    gasPriceOracle = await GasPriceOracle.new();
    logGasDeploy(gasPriceOracle);
    // For testing purposes set it really high for now
    await gasPriceOracle.initialize(toWei('500', 'ether'));

    bancorFormula = await BancorFormula.new();
    logGasDeploy(bancorFormula, "Bancor Formula");

    mERC20 = await MockERC20.new(toWei('1000000', 'ether'));
    logGasDeploy(mERC20, "Mock ERC20");

    baseAccount = await Account.new();
    logGasDeploy(baseAccount, "Account");

    cvgBeta = await ConvergentBeta.new();
    logGasDeploy(cvgBeta, "Convergent Beta");
    const initTx = await cvgBeta.initialize(
      baseAccount.address,
      bancorFormula.address,
      gasPriceOracle.address,
    );
    logGasTx(initTx, "ConvergentBeta::initialize()");
  });

  it('checks view functions', async () => {
    const retBaseAccount = await cvgBeta.baseAccount();
    expect(
      retBaseAccount
    ).to.equal(baseAccount.address);

    const retBancorFormula = await cvgBeta.bancorFormula();
    expect(
      retBancorFormula
    ).to.equal(bancorFormula.address);
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
    /**
     * Linear Curve
     * RR - 500000
     * vSupply - 1000000000000000000
     * vReserve - 500000000000000
     */

    const newAccountTx = await cvgBeta.newAccount(
      randBytes,
      "Test Token",
      "TEST",
      mERC20.address,
      "500000",
      "1000000000000000000",
      "500000000000000",
      "10",
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

    // Now test the bft
    const retBFT = await acc.bft();
    // console.log(retBFT);
    const bft = await BondedFungibleToken.at(retBFT);
    const retPPM = await bft.PPM();
    expect(
      retPPM.toString()
    ).to.equal("1000000");

    const retRR = await bft.reserveRatio();
    expect(
      retRR.toString()
    ).to.equal("500000");

    const retOwner = await bft.owner();
    expect(
      retOwner.toLowerCase()
    ).to.equal(accounts[3].toLowerCase());

    const retName = await bft.name();
    expect(
      retName
    ).to.equal("Test Token");

    const retSymbol = await bft.symbol();
    expect(
      retSymbol
    ).to.equal("TEST");

    const retRAsset = await bft.reserveAsset();
    expect(
      retRAsset.toLowerCase()
    ).to.equal(mERC20.address.toLowerCase());

    const retReserve = await bft.reserve();
    expect(
      retReserve.toString()
    ).to.equal("0");

    const retVS = await bft.virtualSupply();
    expect(
      retVS.toString()
    ).to.equal("1000000000000000000")

    const retVR = await bft.virtualReserve();
    expect(
      retVR.toString()
    ).to.equal("500000000000000");

    const retHC = await bft.heldContributions();
    expect(
      retHC.toString()
    ).to.equal("0");

    const retBF = await bft.bancorFormula();
    expect(
      retBF.toLowerCase()
    ).to.equal(bancorFormula.address.toLowerCase());

    const retCP = await bft.creatorPercentage();
    expect(
      retCP.toString()
    ).to.equal("10");
  });
});
