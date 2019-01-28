import Decimal from 'decimal.js';
const { fromWei, toWei } = require('web3').utils;

const assert = (a: any, msg?: string) => {
  if (!!a === true) {
    return true;
  }
  throw new Error('Assertion ' + a + ' failed with message ' + msg);
}

const toDecimal = (a: number|string): Decimal => new Decimal(a);

assert(toDecimal('0.5').toString() === '0.5');

// N is the exponent of the y = mx ^ n function.
const getN = (rr: Decimal, precision: Decimal): Decimal => {
  return precision.div(rr).minus(1);
};

// console.log(
//   getN(toDecimal(333333), toDecimal(1000000)).toString()
// )

assert(
  getN(toDecimal(500000), toDecimal(1000000)).toString() === '1'
);

// M is the slope, s is supply, r is reserve, rr = reserveRatio
const getM = (s: Decimal, r: Decimal, rr: Decimal, precision: Decimal): Decimal => {
  const n = getN(rr, precision);
  return r.mul(n.add(1)).mul(toDecimal(10).pow(toDecimal(18)))
    .div(s.pow(n.add(1)));
}

console.log('slope: ', getM(
  toDecimal(toWei('1')),
  toDecimal(toWei('0.00005')),
  toDecimal('500000'),
  toDecimal('1000000')
).toString());

class Polynomial {
  private exponent: Decimal;
  private slope: Decimal;

  constructor(n: Decimal, m: Decimal) {
    this.exponent = n;
    this.slope = m;
  }

  y(x: Decimal): Decimal {
    return this.slope.mul(x.pow(this.exponent));
  }

  integral(x: Decimal) {
    const nexp = this.exponent.add(1);
    return this.slope.mul((x.pow(nexp)).div(nexp));
  }

  solveForX(integral: Decimal): Decimal {
    const nexp = this.exponent.add(1);

    const stepOne = integral.div(this.slope);
    const stepTwo = stepOne.mul(nexp);
    const stepThree = stepTwo.pow(
      toDecimal(1).div(nexp)
    );
    return stepThree;
  }
}

type VirtualParams = { vSupply: Decimal, vReserve: Decimal };

const getVirtualParams = (n: Decimal, m: Decimal, c: Decimal): VirtualParams => {
  // First try setting vReserve to c and calculating vSupply
  let vReserve = c;
  let vSupply = (() => {
    const nexp: Decimal = n.add(toDecimal(1));
    return (nexp.div(m)).pow((c.div(nexp))); 
  })();

  // If vSupply is less than 1 whole unit it means that the slope
  // is too steep to calculate this way and we try to do it 
  // in the reserve manner by setting vSupply to 1 and calculating
  // vReserve
  if (vSupply.lessThan(toDecimal(1))) {
    vSupply = c;
    vReserve = (() => {
      const nexp: Decimal = n.add(toDecimal(1));
      return (m.div(nexp)).mul((c.pow(nexp)));
    })();
  }

  return {
    vSupply,
    vReserve,
  };
}

const poly = new Polynomial(
  toDecimal('1'),
  toDecimal('0.001'),
);

const reduceTokenDecimals = (a: Decimal): Decimal => {
  const decimals: Decimal = toDecimal(10).pow(toDecimal(18));
  return a.div(decimals);
}

const integral = poly.integral(toDecimal(toWei('1')));
console.log('integral:', reduceTokenDecimals(reduceTokenDecimals(integral)).toString())


/**
 * altVP returns the starting virtual reserve
 * @param p Polynomial with the desired exponent and slope
 * @param x Starting virtual supply
 */
const altVP = (p: Polynomial, x: Decimal): VirtualParams => {
  const integral = poly.integral(x);
  return {
    vSupply: x,
    vReserve: reduceTokenDecimals(integral),
  };
}

const res2 = altVP(poly, toDecimal(toWei('1')))
console.log('starting vReserve: ', res2.vReserve.toString(), 'starting vSupply: ', res2.vSupply.toString())

const res = getVirtualParams(
  toDecimal(1),
  toDecimal("0.001"),
  toDecimal(toWei('1'))
);

console.log('vSupply:', res.vSupply.toString(), 'vReserve:', res.vReserve.toString());
// console.log(poly.integral(toDecimal(1)).toString());

console.log(
  getM(
    toDecimal(1),
    toDecimal(1),
    toDecimal(333333),
    toDecimal(1000000)
  ).toString()
);

export default {
  getN,
  getM,
  toDecimal,
}
