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

    bft = await BFT.new()
    expect(bft.address).to.exist;
    await bft.init(accounts[0], 'Achill', 'ACT', mERC20.address, 500000, 200000, 0, 0);
  });

  it('Returns expected parameters on initialization', async () => {
    const ppm = await bft.PPM();
    const reserveAsset = await bft.reserveAsset();
    const name = await bft.name();
    const owner = await bft.owner();
    expect(
      ppm.toNumber()
    ).to.equal(1000000);
    expect(mERC20.address).to.exist;
    expect(reserveAsset).to.equal(mERC20.address);
    expect(name).to.equal('Achill');
    expect(owner).to.equal(accounts[0]);

    const reserve = await bft.reserve();
    expect(
      reserve.toString()
    ).to.equal('0');

    const heldContributions = await bft.heldContributions();
    expect(
      heldContributions.toString()
    ).to.equal('0');
  });


  // it('Tests some view functions', async () => {
  //   const numTokens = toBN(2100).mul(PT_SCALE);
  //   const cost = await lp.cost(numTokens.toString());
  //   console.log(fromWei(cost.div(PT_PRECISION).toString()));
  // });
});
