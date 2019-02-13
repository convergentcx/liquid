const BancorAdaptor = artifacts.require('BancorAdaptor');

const { expect } = require('chai');

const { fromWei, toWei } = web3.utils;

contract('BancorAdaptor', (accounts) => {
  let ba;

  before(async () => {
    ba = await BancorAdaptor.new(
      500000,
      10,
      '1000000000000000000',
      '500000000000000',
    );

    expect(ba.address).to.exist;

  });

  it('runs', async () => {
    const retExp = await ba.exponent();
    console.log(retExp.toString());
    // expect(
    //   retExp.toString()
    // ).to.equal('7000008500');

    const retSlope = await ba.slope();
    console.log(retSlope.toString());

//     const slope = await ba.calculateSlope(toWei('1'), toWei('0.0005'))
//     const { a, b, c } = slope.logs[0].args;
//     console.log(
// `
// Top: ${a.toString()}
// Bottom: ${b.toString()}
// Result: ${c.toString()}
// `
//     )

    // expect(true).to.be.false;

    // const int = await ba.integral(toWei('1', 'ether'));
    // console.log(fromWei(int.toString()));
  });
});