import Decimal from 'decimal.js';

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

assert(
  getN(toDecimal(500000), toDecimal(1000000)).toString() === '1'
);

// M is the slope, s is supply, r is reserve, rr = reserveRatio
const getM = (s: Decimal, r: Decimal, rr: Decimal, precision: Decimal): Decimal => {
  const n = getN(rr, precision);
  return r.mul(n.add(1))
    .div(s.pow(n.add(1)));
}

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

const poly = new Polynomial(
  toDecimal('0.5'),
  toDecimal('0.001'),
);

console.log(poly.integral(toDecimal(1000)).toString());

console.log(
  getM(
    toDecimal(100),
    toDecimal(5),
    toDecimal(500000),
    toDecimal(1000000)
  ).toString()
);

export default {
  getN,
  getM,
  toDecimal,
}
