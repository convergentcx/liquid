// const Account = artifacts.require('Account');
// const ConvergentBeta = artifacts.require('ConvergentBeta');
// const Curves = artifacts.require('Curves');
// const LiquidityProvider = artifacts.require('LiquidityProvider');
// const MockERC20 = artifacts.require('MockERC20');
// const Polynomial = artifacts.require('Polynomial');

// const { expect } = require('chai');

// const PolynomialPresets = {
//   simpleLinear: {
//     buy: {
//       slopeN: 1000,
//       slopeD: 1,
//       expN: 1,
//       expD: 1,
//     },
//     sell: {
//       slopeN: 500,
//       slopeD: 1,
//       expN: 1,
//       expD: 1,
//     },
//   }
// };

// const genMetadata = () => (
//   "0x" + "EE".repeat(32)
// );

// const findEventFromReceipt = (receipt, eventName) => (
//   receipt.logs.find(log => log.event === eventName)
// );

// contract('ConvergentBeta', (accounts) => {
//   let cvgBeta, cvgAccount;
//   let buyCurve, sellCurve;
//   let curves;

//   it('deploys all contracts', async () => {
//     // First deploy the curves.
//     buyCurve = await Polynomial.new(
//       1000,
//       1,
//       1,
//       1,
//     );
//     expect(buyCurve.address).to.exist;

//     sellCurve = await Polynomial.new(
//       500,
//       1,
//       1,
//       1,
//     );
//     expect(sellCurve.address).to.exist;

//     curves = await Curves.new(buyCurve.address, sellCurve.address);
//     expect(curves.address).to.exist;

//     cvgAccount = await Account.new();
//     expect(cvgAccount.address).to.exist;

//     cvgBeta = await ConvergentBeta.new(cvgAccount.address, curves.address);
//     expect(cvgBeta.address).to.exist;

//     // const tx = await cvgBeta.newAccount(genMetadata());
//     // // console.log(tx)
//     // const createdEvent = findEventFromReceipt(tx.receipt, "NEW_ACCOUNT");
//     // const newAccount = await Account.at(createdEvent.args.account);
//     // const lp = await LiquidityProvider.at(await newAccount.liquidityProvider());
//     // const buy = await lp.buy('12000');
//     // console.log(buy)
//     // /// TODO: Test the failure of this function...
//     // // const res = await newAccount.initialize(
//     // //   accounts[0],
//     // //   genMetadata(),
//     // //   curves.address,
//     // // );
//     // // console.log(res);


//   });
// });
