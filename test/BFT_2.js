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
    mERC20 = await MockERC20.new(toWei('50000', 'ether'));

    bancorFormula = await BancorFormula.new();
    expect(bancorFormula.address).to.exist;

    bft = await BondedFungibleToken.new();
    await bft.init(
      accounts[0],
      "Bonded Fungible Token One",
      "BFT1",
      mERC20.address,
      500000,
      500000,
      toWei('1'),
      toWei('0.0005'),
      toWei('1'),
      toWei('0.0005'),
      bancorFormula.address,
    );
  });

  it('runs', async () => {
    await mERC20.approve(bft.address, toWei('20000000'));

    const buysThenSells = async (amt) => {
      const pr = await bft.purchaseReturn(
        toWei(amt, 'ether'),
      );

      const amtReserved = await bft.calcAmountToReserve(pr.toString());

      const buyTx = await bft.buy(
        toWei(amt, 'ether'),
        0,
        0,
      );

      console.log(
`
Buying with ${amt} ether
-------------------
Purchase Return - ${fromWei(pr)} tokens
Amount Reserved - ${fromWei(amtReserved)} ether
Gas Used (buy)  - ${buyTx.receipt.gasUsed}
`
      );

      const sr = await bft.sellReturn(pr.toString());
      const sellTx = await bft.sell(pr.toString(), 0, 0);
      const fakeReserve = await bft.fakeReserve();
      const reserve = await bft.reserve();

      console.log(
`
Selling ${fromWei(pr)} tokens
-------------------------------
Sell Return     - ${fromWei(sr)} ether
Gas Used (sell) - ${sellTx.receipt.gasUsed}
Fake Reserve    - ${fromWei(fakeReserve)}
Reserve         - ${fromWei(reserve)}
`
      );
    }


    const shortTests = [
      '0.001',
      '0.01',
      '0.1',
      '1',
      '2',
      '5',
      '10',
      '100',
      '1000',
    ];
    
    await buysThenSells('0.001')
    await buysThenSells('0.01')
    await buysThenSells('0.1')
    await buysThenSells('1')
    await buysThenSells('2')
    await buysThenSells('5')
    await buysThenSells('10')
    await buysThenSells('100')
    await buysThenSells('1000')
    // const pr = await bft.purchaseReturn(toWei('3', 'ether'));
    // // console.log(fromWei(pr));
    // const ret = await bft.calcAmountToReserve(pr.toString());
    // console.log(ret.toString());
    // const buyTx = await bft.buy(toWei('3', 'ether'), 0, 0);
    // // console.log(buyTx)
    // const ret2 = await bft.sellReturn(pr.toString());
    // console.log(ret2.toString());

    // const sellTx = await bft.sell(pr.toString(), 0, 0);
    // console.log(sellTx);

    // const fakeReserve = await bft.fakeReserve();
    // console.log(fakeReserve.toString());
    // const reserve = await bft.reserve();
    // console.log(reserve.toString());
  });
});