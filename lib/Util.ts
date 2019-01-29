import Decimal from 'decimal.js';

const toDecimal = (a: number|string): Decimal => new Decimal(a);

const reduceTokenDecimals = (a: Decimal): Decimal => {
  const decimals: Decimal = toDecimal(10).pow(toDecimal(18));
  return a.div(decimals);
}

// N is the exponent of the y = mx ^ n function.
const getN = (rr: Decimal, precision: Decimal): Decimal => {
  return precision.div(rr).minus(1);
};

// M is the slope, s is supply, r is reserve, rr = reserveRatio
const getM = (s: Decimal, r: Decimal, rr: Decimal, precision: Decimal): Decimal => {
  const n = getN(rr, precision);
  return r.mul(n.add(1)).mul(toDecimal(10).pow(toDecimal(18)))
    .div(s.pow(n.add(1)));
};

const getRR = (n: Decimal): Decimal => {
  const ppm = toDecimal(1000000);
  return ppm.div(n.add(1));
}

export {
  toDecimal,
  getN,
  getM,
  getRR,
  reduceTokenDecimals,
};
