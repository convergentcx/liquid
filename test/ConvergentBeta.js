const BancorFormula = artifacts.require('BancorFormula');
const BondedFungibleToken = artifacts.require('BondedFungibleToken');
const ConvergentBeta = artifacts.require('ConvergentBeta');
const MockERC20 = artifacts.require('MockERC20');

const { expect } = require('chai');

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

const logGas = async contract => {
  // console.log(contract);
  const { transactionHash } = contract;
  if (!transactionHash) {
    throw new Error('Transaction hash not found on contract object');
  }
  const receipt = await web3.eth.getTransactionReceipt(transactionHash);
  console.log(
`
${contract.contractName}
----------------
Deploy Gas - ${receipt.gasUsed}
`
  );
}

contract('ConvergentBeta', (accounts) => {
  let cvgBeta, mERC20;

  before(async () => {
    const bancorFormula = await BancorFormula.new();
    logGas(bancorFormula);
  });

  it('runs', async () => {

  });
});