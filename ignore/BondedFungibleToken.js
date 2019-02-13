const MockERC20 = artifacts.require('MockERC20');
const BFT = artifacts.require('BondedFungibleToken');
const BancorFormula = artifacts.require('BancorFormula');


const { expect } = require('chai');

const { ERC20_DECIMALS, PT_DECIMALS, PT_PRECISION, PT_SCALE } = require('../lib/consts');
const { fromWei, toWei, toBN } = web3.utils;

// ATTENTION THE FORMULAS BELOW DO NOT WORK IN PRACTICE, BECAUSE OF JS PRECISION PROBLEMS
// the scripts Logan wrote help us get m and n from the bancor formula
// using those values we can now get the minimum "virtualMint" that initializes the curve on a negligibly higher level
// (without distorting the slope) in order to circumvent the problem that Bancor formula doesn't work when supply and reserve equal 0.
getVirtualParams = (m, n) => {
  // first approach (for most cases, because usually curves start flat): 
  // A. set vReserve to the smallest acceptable value which is 1 (= 1 x fullERC20 token/10^18)
  // B. set vSupply to the token amount which if bought would have led to that reserve being in the contract
  // (again expressed in granular units of fullERC20/10^18)
  let vReserve = 1;
  let vSupply = (((n + 1) / (m * 10 ** 18)) ^ (1 / (n + 1))) * 10 ** 18; // this can be reverse calculated by setting the integral of a mx^n function to 1 with the appropriate decimals
  // but if the curve is very steep, the token amount needed to get 1 unit of reserve could be smaller than 1!
  // then we need to go the other way around:
  // A) set the virtual token amount to the smallest possible acceptable value namely 1
  // B) calculate the corresponding reserve, which will necessarily be bigger than 1 since the price function is always increasing (m>0):
  if (vSupply < 1) {
    vSupply = 1;
    vReserve = (m / (n + 1)) * ((1 / 10 ** 18) ^ (n + 1));
  }
  // console.log('vSupply: ', vSupply, 'vReserve: ', vReserve);
  return vSupply, vReserve;
}

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
    const userReserveBalance = 10000000000000;
    mERC20 = await deployMockERC20(userReserveBalance); // needs to be expressed with 10^18 decimals
    expect(mERC20.address).to.exist;
    const retUserReserveBalance = await mERC20.balanceOf(accounts[0]);
    expect(
      retUserReserveBalance.toNumber()
    ).to.equal(userReserveBalance);

    bancorFormula = await BancorFormula.new();
    expect(bancorFormula.address).to.exist;

    bft = await BFT.new()
    expect(bft.address).to.exist;
    // get virtualParams here, to stick in instead of 2466212074330/2603499175330, 1:
    // for now set m=0.2 and n=2 => rrBuy=1/3 for buy
    // and m=0.17 and n=2 => rrSell=1/3 for sell
    await bft.init(accounts[0], 'Achill', 'ACT', mERC20.address, 333333, 333333, 2466212074330, 1, 2603499175330, 1, bancorFormula.address);

    // approve bft to spend user's ERC20 reserve asset
    const reserveApproval = 10000000000000;
    await mERC20.approve(bft.address, reserveApproval);

  });

  it('Returns expected parameters on initialization', async () => {
    const retPpm = await bft.PPM();
    const retReserveAsset = await bft.reserveAsset();
    const retName = await bft.name();
    const retOwner = await bft.owner();
    const totalSupply = await bft.totalSupply();

    expect(
      retPpm.toNumber()
    ).to.equal(1000000);
    expect(mERC20.address).to.exist;
    expect(retReserveAsset).to.equal(mERC20.address);
    expect(retName).to.equal('Achill');
    expect(retOwner).to.equal(accounts[0]);
    expect(totalSupply.toString()).to.equal('0');


    const virtualSupplyBuy = await bft.virtualSupplyBuy();
    const virtualSupplySell = await bft.virtualSupplySell();
    const virtualReserveBuy = await bft.virtualReserveBuy();
    const virtualReserveSell = await bft.virtualReserveSell();

    expect(
      virtualSupplyBuy.toString()
    ).to.equal('2466212074330');
    expect(
      virtualSupplySell.toString()
    ).to.equal('2603499175330');
    expect(
      virtualReserveBuy.toString()
    ).to.equal('1');
    expect(
      virtualReserveSell.toString()
    ).to.equal('1');

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
    const toSpendTest = 10000000000000;
    await bft.buy(toSpendTest, 0, 0);
    // const retHeldContributions = await bft.heldContributions();
    // expect(retHeldContributions.toString()
    // ).to.equal('999');

    const userBalance = await bft.balanceOf(accounts[0])
    expect(userBalance.toString()
    ).to.equal('53129932096307017'); // calculated by solving for x with integral: 53132900000000000, but too big to use as number and do closeTo

    const retTotalSupply = await bft.totalSupply();
    expect(retTotalSupply.toString()
    ).to.equal('53129932096307017'); 

    const retReserve = await bft.reserve();
    expect(retReserve.toString()
    ).to.equal('1');
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
