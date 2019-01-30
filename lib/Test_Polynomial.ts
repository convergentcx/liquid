import Decimal from 'decimal.js';
const { fromWei, toWei } = require('web3').utils;

import Polynomial from './Polynomial';

import {
  toDecimal,
  getN,
  getM,
  getRR,
  reduceTokenDecimals,
} from './Util';

// Buy Curve
const exponentOne = toDecimal('0.7');
const slopeOne = toDecimal('1000000');

// Sell Curve
const exponentTwo = toDecimal('1.3');
const slopeTwo = toDecimal('0.0000002');

const printPolynomial = (n: Decimal, m: Decimal): void => {
  const poly = new Polynomial(n, m);
  const vp = poly.getVirtualParams(
    toDecimal(toWei('1'))
  );
  console.log(
`
For polynomial:
f(x) = ${m.toString()}x^${n.toString()}
`
  );
  console.log(
    'vSupply:',
    vp.vSupply.toString(),
    'vReserve:',
    vp.vReserve.toString(),
  );
  console.log('Reserve Ratio:', getRR(n).toString());
};

printPolynomial(
  exponentOne,
  slopeOne,
);

printPolynomial(
  exponentTwo,
  slopeTwo,
);

// Linear Curve
const exponentLinear = toDecimal('1');
const slopeLinear = toDecimal('0.001');

printPolynomial(
  exponentLinear,
  slopeLinear,
);
