const web3 = require('web3');

const {
  utils: {
    toBN,
    fromWei,
  }
} = web3;

// Token decimals ... 8
const DECIMALS = toBN(10).pow(toBN(8));

// Precision ... 20
const PRECISION = toBN(10).pow(toBN(20));

// Scale including token decimals and precision.
const SCALE = DECIMALS.mul(PRECISION);

// Max exponent ... 2.5
const MAX_EXP = 5 / 2;

// Max supply 21,000,000
const MAX_SUPPLY = toBN(2.1 * 10**7);

module.exports = {
  DECIMALS,
  MAX_EXP,
  MAX_SUPPLY,
  PRECISION,
  SCALE,
};
