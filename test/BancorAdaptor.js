const BancorAdaptor = artifacts.require('BancorAdaptor');

const { expect } = require('chai');

const { toWei } = web3.utils;

contract('BancorAdaptor', (accounts) => {
  let ba;

  before(async () => {
    ba = await BancorAdaptor.new(
      500000,
      10,
      45,
      1
    );

    expect(ba.address).to.exist;

  });

  it('runs', async () => {
    const retExp = await ba.exponent();
    expect(
      retExp.toString()
    ).to.equal('10000000000');

    const retSlope = await ba.slope();
    // console.log(retSlope.toString());
    // expect(true).to.be.false;

    const int = await ba.integral(toWei('210000000000', 'ether'));
    console.log(int.toString());
  });
});