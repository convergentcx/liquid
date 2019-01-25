const MockERC20 = artifacts.require('MockERC20');
const BFT = artifacts.require('BondedFungibleToken');

const { expect } = require('chai');

const { ERC20_DECIMALS, PT_DECIMALS, PT_PRECISION, PT_SCALE } = require('../lib/consts');
const { fromWei, toWei, toBN } = web3.utils;


const deployMockERC20 = async (supply) => {
  const mock = await MockERC20.new(supply);
  const retSupply = await mock.totalSupply();
  expect(
    supply,
    "Failed `deployMockERC20` initial supply sanity check",
  ).to.equal(retSupply.toString());
  return mock;
}

contract('BondedFungibleToken', (accounts) => {
  let bft, mERC20;

  before(async () => {
    mERC20 = await deployMockERC20(toWei('1', 'ether')); // why is the argument ether here? this is a generic ERC20, so the supply should just be a number
    expect(mERC20.address).to.exist;

    // bft = await BFT.new()
    // expect(bft.address).to.exist;

    // await lp.initialize(curves.address, mERC20.address);
    // lt = await lp.liquidToken();
    // expect(lt).to.exist;
  });

  it('Returns expected parameters on initialization', async () => {
    // const ppm = await bft.PPM();
    // expect(
    //   ppm
    // ).to.equal(1000000);
    expect(mERC20.address).to.exist;

  });
  //   const reserve = await lp.reserve();
  //   expect(
  //     reserve.toString()
  //   ).to.equal('0');

  //   const retCurves = await lp.curves();
  //   expect(
  //     retCurves
  //   ).to.equal(curves.address);

  //   const heldContributions = await lp.heldContributions();
  //   expect(
  //     heldContributions.toString()
  //   ).to.equal('0');

  //   const liquidToken = await lp.liquidToken();
  //   expect(
  //     liquidToken
  //   ).to.equal(lt);
  // });

  // it('Tests some view functions', async () => {
  //   const numTokens = toBN(2100).mul(PT_SCALE);
  //   const cost = await lp.cost(numTokens.toString());
  //   console.log(fromWei(cost.div(PT_PRECISION).toString()));
  // });
});
