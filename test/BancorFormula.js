const BancorFormula = artifacts.require('BancorFormula');

const { expect } = require('chai');

contract('BancorFormula', (accounts) => {
    before(async () => {
        bancor = await BancorFormula.new()
        expect(bancor.address).to.exist;
    });


    it('Calculates purchase amount correctly', async () => {
        const totalSupplyTest = 2466212074330;
        const reserveTest = 1;
        const reserveRatioBuyTest = 333333;
        const toSpendTest = 1000000;

        const retPurchaseAmount = await bancor.calculatePurchaseReturn(totalSupplyTest, reserveTest, reserveRatioBuyTest, toSpendTest)

        expect(
            retPurchaseAmount.toNumber()
        ).to.be.closeTo(244153941835234, 10000000000); // calculated using integration or slava's method
    })
    
    it('Calculates sale return correctly', async () => {
        const totalSupplyTest = 10000000000000; 
        const reserveTest = 56;
        const reserveRatioSellTest = 333333;
        const toSellTest = 1000000000000;

        const retSaleReturn = await bancor.calculateSaleReturn(totalSupplyTest, reserveTest, reserveRatioSellTest, toSellTest)

        expect(
            retSaleReturn.toNumber()
        ).to.be.closeTo(15, 1); // calculated using integration or slava's method

        const otherSaleReturn = await bancor.calculateSaleReturn(53129932096307017+2603499175330, )
    });


});
