const Curves = artifacts.require('Curves');
const LiquidityProvider = artifacts.require('LiquidityProvider');
const LiquidToken = artifacts.require('LiquidToken');
const MockERC20 = artifacts.require('MockERC20');
const Polynomial = artifacts.require('Polynomial');

const { expect } = require('chai');

// const { DECIMALS, PRECISION } = require('../lib/consts');
const { toWei } = web3.utils;

const deploySimpleCurves = async () => {
  const buyCurve = await Polynomial.new(
    1000,
    1,
    1,
    1,
  );
  const sellCurve = await Polynomial.new(
    500,
    1,
    1,
    1,
  );
  return Curves.new(buyCurve.address, sellCurve.address);
};

const deployMockERC20 = async (supply) => {
  const mock = await MockERC20.new(supply);
  const retSupply = await mock.totalSupply();
  expect(
    supply,
    "Failed `deployMockERC20` initial supply sanity check",
  ).to.equal(retSupply.toString());
  return mock;
}

contract('LiquidityProvider', (accounts) => {
  let curves, lp, lt, mERC20;

  before(async () => {
    curves = await deploySimpleCurves();
    mERC20 = await deployMockERC20(toWei('1', 'ether'));

    expect(curves.address).to.exist;
    expect(mERC20.address).to.exist;

    lp = await LiquidityProvider.new();
    expect(lp.address).to.exist;
  
    await lp.initialize(curves.address, mERC20.address);
    lt = await lp.liquidToken();
    expect(lt).to.exist;
  });

  it('Returns expected parameters on initialization', async () => {
    const reserveAsset = await lp.reserveAsset();
    expect(
      reserveAsset
    ).to.equal(mERC20.address);

    const reserve = await lp.reserve();
    expect(
      reserve.toString()
    ).to.equal('0');

    const retCurves = await lp.curves();
    expect(
      retCurves
    ).to.equal(curves.address);

    const heldContributions = await lp.heldContributions();
    expect(
      heldContributions.toString()
    ).to.equal('0');

    const liquidToken = await lp.liquidToken();
    expect(
      liquidToken
    ).to.equal(lt);
  });
});
