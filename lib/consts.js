const web3 = require('web3');

const {
  utils: {
    toBN,
    fromWei,
  }
} = web3;

// Token decimals ... 8
const PT_DECIMALS = toBN(10).pow(toBN(8));

// Precision ... 20
const PT_PRECISION = toBN(10).pow(toBN(20));

// Scale including token decimals and precision.
const PT_SCALE = PT_DECIMALS.mul(PT_PRECISION);

// Max exponent ... 2.5
const MAX_EXP = 5 / 2;

// Max supply 21,000,000
const MAX_SUPPLY = toBN(2.1 * 10**7);

// ERC20
const ERC20_DECIMALS = toBN(10).pow(toBN(18));

module.exports = {
  PT_DECIMALS,
  MAX_EXP,
  MAX_SUPPLY,
  PT_PRECISION,
  PT_SCALE,
  ERC20_DECIMALS,
};
