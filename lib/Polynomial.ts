import Decimal from 'decimal.js';

import {
  toDecimal,
  getN,
  getM,
  reduceTokenDecimals,
} from './Util';

type VirtualParams = { vSupply: Decimal, vReserve: Decimal };

class Polynomial {
  private exponent: Decimal;
  private slope: Decimal;

  static fromBancorParams = (
    s: Decimal,
    r: Decimal,
    rr: Decimal,
    ppm: Decimal,
  ): Polynomial => {
    const n = getN(rr, ppm);
    const m = getM(s, r, rr, ppm);
    return new Polynomial(n, m);
  }

  constructor(n: Decimal, m: Decimal) {
    this.exponent = n;
    this.slope = m;
  }

  /**
   * Solves for Y given an `x` value
   * @param x The x to solve for
   */
  y(x: Decimal): Decimal {
    return this.slope.mul(x.pow(this.exponent));
  }

  /**
   * Solves for the integral given an `x` value
   * @param x The x to solve for
   */
  integral(x: Decimal): Decimal {
    const nexp = this.exponent.add(1);
    return this.slope.mul((x.pow(nexp)).div(nexp));
  }

  /**
   * Solves for `x` value given an integral
   * @param integral The integral value to solve for
   */
  solveForX(integral: Decimal): Decimal {
    const nexp = this.exponent.add(1);

    const stepOne = integral.div(this.slope);
    const stepTwo = stepOne.mul(nexp);
    const stepThree = stepTwo.pow(
      toDecimal(1).div(nexp)
    );
    return stepThree;
  }

  getVirtualParams(s: Decimal): VirtualParams {
    const integral = this.integral(s);
    return {
      vSupply: s,
      vReserve: reduceTokenDecimals(integral),
    };
  }
};

export default Polynomial;
