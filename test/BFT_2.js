const BancorFormula = artifacts.require('BancorFormula');
const BondedFungibleToken = artifacts.require('BondedFungibleToken');
const MockERC20 = artifacts.require('MockERC20');

const { expect } = require('chai');

const { fromWei, toBN, toWei } = web3.utils;

const {
  getN,
  getM,
  toDecimal,
} = require('../lib/utils.js');

contract("BondedFungibleToken", (accounts) => {
  let bft, mERC20;

  before(async () => {
    mERC20 = await MockERC20.new(toWei('10', 'ether'));

    bancorFormula = await BancorFormula.new();
    expect(bancorFormula.address).to.exist;

    bft = await BondedFungibleToken.new();
    await bft.init(
      accounts[0],
      "Bonded Fungible Token One",
      "BFT1",
      mERC20.address,
      333333,
      500000,
      45,
      1,
      45,
      1,
      bancorFormula.address,
    );
  });

  it('runs', async () => {
    await mERC20.approve(bft.address, toWei('20000000'));

    const pr = await bft.purchaseReturn(toWei('3', 'ether'));
    // console.log(fromWei(pr));
    const ret = await bft.calcAmountToReserve(pr.toString());
    console.log(ret.toString());
    const buyTx = await bft.buy(toWei('3', 'ether'), 0, 0);
    // console.log(buyTx)
    const ret2 = await bft.sellReturn(pr.toString());
    console.log(ret2.toString());

    const sellTx = await bft.sell(pr.toString(), 0, 0);
    console.log(sellTx);

    const fakeReserve = await bft.fakeReserve();
    console.log(fakeReserve.toString());
    const reserve = await bft.reserve();
    console.log(reserve.toString());
  });
});