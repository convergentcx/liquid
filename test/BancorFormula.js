const BancorFormula = artifacts.require('BancorFormula');

const { expect } = require('chai');

contract('BancorFormula', (accounts) => {
    before(async () => {
        bancor = await BancorFormula.new()
        expect(bancor.address).to.exist;
    });


    it('Calculates purchase amount correctly', async () => {
        const totalSupplyTest = 10000;
        const reserveTest = 100;
        const reserveRatioBuyTest = 500000;
        const toSpendTest = 1000

        const retPurchaseAmount = await bancor.calculatePurchaseReturn(totalSupplyTest, reserveTest, reserveRatioBuyTest, toSpendTest)

        expect(
            retPurchaseAmount.toNumber()
        ).to.equal(23166);
    });

    it('Calculates sale return correctly', async () => {
        const totalSupplyTest = 10000;
        const reserveTest = 100;
        const reserveRatioBuyTest = 500000;
        const toSellTest = 1000

        const retSaleReturn = await bancor.calculateSaleReturn(totalSupplyTest, reserveTest, reserveRatioBuyTest, toSellTest)

        expect(
            retSaleReturn.toNumber()
        ).to.equal(18);
    });


});
