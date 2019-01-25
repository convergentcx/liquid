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
  ).to.equal(retSupply.toNumber());
  return mock;
}

contract('BondedFungibleToken', (accounts) => {
  let bft, mERC20;

  before(async () => {
    const userReserveBalance = 1000000
    mERC20 = await deployMockERC20(userReserveBalance); // why was the argument expressed in wei here? this is a generic ERC20, so the supply should just be a number
    expect(mERC20.address).to.exist;
    const retUserReserveBalance = await mERC20.balanceOf(accounts[0]);
    expect(
      retUserReserveBalance.toNumber()
    ).to.equal(userReserveBalance);

    bft = await BFT.new()
    expect(bft.address).to.exist;
    await bft.init(accounts[0], 'Achill', 'ACT', mERC20.address, 500000, 200000, 0, 0);

    // approve bft to spend user's ERC20 reserve asset
    const reserveApproval = 1000;
    await mERC20.approve(bft.address, reserveApproval);

  });

  it('Returns expected parameters on initialization', async () => {
    const retPpm = await bft.PPM();
    const retReserveAsset = await bft.reserveAsset();
    const retName = await bft.name();
    const retOwner = await bft.owner();
    expect(
      retPpm.toNumber()
    ).to.equal(1000000);
    expect(mERC20.address).to.exist;
    expect(retReserveAsset).to.equal(mERC20.address);
    expect(retName).to.equal('Achill');
    expect(retOwner).to.equal(accounts[0]);

    const reserve = await bft.reserve();
    expect(
      reserve.toString()
    ).to.equal('0');

    const heldContributions = await bft.heldContributions();
    expect(
      heldContributions.toString()
    ).to.equal('0');
  });


  it('Allows buying token', async () => {
    const toSpendTest = 1000
    // const retTotalSupply = await bft.totalSupply();
    // const retReserve = await bft.reserve();
    // const retReserveRatioBuy = await bft.reserveRatioBuy();
    
    await bft.buy(toSpendTest, 0, 0);
    const retReserve = await bft.reserve();
    expect(retReserve.toString()
    ).to.equal('1');

    const retHeldContributions = await bft.heldContributions();
    expect(retHeldContributions.toString()
    ).to.equal('999');

    const userBalance = await bft.balanceOf(accounts[0])
    expect(userBalance.toString()
    ).to.equal('30');
  });


  it('Allows selling token', async () => {
    await bft.sell(30);
    const retReserve = await bft.reserve();
    expect(retReserve.toString()
    ).to.equal('1');
  });

  // it('Tests some view functions', async () => {
  //   const numTokens = toBN(2100).mul(PT_SCALE);
  //   const cost = await bft.cost(numTokens.toString());
  //   console.log(fromWei(cost.div(PT_PRECISION).toString()));
  // });
});
