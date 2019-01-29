const BancorFormula = artifacts.require('BancorFormula');
const BondedFungibleToken = artifacts.require('BondedFungibleToken');
const MockERC20 = artifacts.require('MockERC20');

const { expect } = require('chai');

const { fromWei, toBN, toWei } = web3.utils;

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

/**
 * Linear Curve
 * RR - 500000
 * vSupply - 1000000000000000000
 * vReserve - 500000000000000
 */

contract("BondedFungibleToken", (accounts) => {
  let bft, mERC20;

  before(async () => {
    mERC20 = await MockERC20.new(toWei('50000', 'ether'));

    bancorFormula = await BancorFormula.new();
    expect(bancorFormula.address).to.exist;

    bft = await BondedFungibleToken.new();
    await bft.init(
      accounts[3],
      "Bonded Fungible Token One",
      "BFT1",
      mERC20.address,
      '500000',
      // 500000,
      '1000000000000000000',
      '500000000000000',
      // toWei('1'),
      // toWei('0.0005'),
      '10',
      bancorFormula.address,
    );
  });

  it('runs', async () => {
    await mERC20.approve(bft.address, toWei('20000000'));

    const buysThenSells = async (amt) => {
      const actualAmountToPurchase = toDecimal(toWei(amt, 'ether')).mul(toDecimal('0.9'));

      const pr = await bft.purchaseReturn(
        actualAmountToPurchase.toString(),
      );

      // const amtReserved = await bft.calcAmountToReserve(pr.toString());

      const buyTx = await bft.buy(
        toWei(amt, 'ether'),
        0,
        0,
      );

      const toSub = poly.solveForX(vReserve);
      // console.log(toSub.toString());
      const solvedX = poly.solveForX(actualAmountToPurchase.add(vReserve)).sub(toSub).div(10**9);
      const reserve1 = await bft.reserve();

      console.log(
`
Buying with ${amt} ether
-------------------
Purchase Return - ${fromWei(pr)} tokens
Gas Used (buy)  - ${buyTx.receipt.gasUsed}
Reserve         - ${reserve1.toString()}
Solved_X        - ${solvedX.toString()}
`
      );
      
      const bal = await bft.balanceOf(accounts[0])
      const sr = await bft.sellReturn(bal.toString());
      // console.log(sr.toString())
      const sellTx = await bft.sell(bal.toString(), 0, 0);
      const reserve = await bft.reserve();

      console.log(
`
Selling ${fromWei(bal.toString())} tokens
-------------------------------
Sell Return     - ${fromWei(sr)} ether
Gas Used (sell) - ${sellTx.receipt.gasUsed}
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
    
    await buysThenSells('0.0005')
    await buysThenSells('0.001')
    await buysThenSells('0.01')
    await buysThenSells('0.1')
    await buysThenSells('1')
    await buysThenSells('2')
    await buysThenSells('5')
    await buysThenSells('10')
    await buysThenSells('100')
    await buysThenSells('1000')
    await bft.sendContributions();
    const bal3 = await mERC20.balanceOf(accounts[3]);
    console.log('Balance of 3:', fromWei(bal3));
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