<<<<<<< HEAD
const BondedFungibleToken = artifacts.require('BondedFungibleToken');
const MockERC20 = artifacts.require('MockERC20');

const { expect } = require('chai');

const { fromWei, toWei } = web3.utils;

const {
  getN,
  getM,
  toDecimal,
} = require('../lib/utils.js');

contract("BondedFungibleToken", (accounts) => {
  let bft, mERC20;

  before(async () => {
    mERC20 = await MockERC20.new(toWei('10', 'ether'));

    bft = await BondedFungibleToken.new();
    await bft.init(
      accounts[0],
      "Bonded Fungible Token One",
      "BFT1",
      mERC20.address,
      333333,
      500000,
      toWei('1', 'ether'),
      toWei('0.333', 'ether'),
    );
  });

  it('runs', async () => {
    await mERC20.approve(bft.address, toWei('20000000'));

    const pr = await bft.purchaseReturn(toWei('333.333', 'ether'));
    console.log(fromWei(pr));
  });
});