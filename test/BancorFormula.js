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
        ).to.be.closeTo(244153941835234, 100000000000); // calculated using integration or slava's method
    });
    
    it('Calculates sale return correctly', async () => {
        const totalSupplyTest = 2603499175330 + 10000000000000; 
        const reserveTest = 1;
        const reserveRatioSellTest = 333333;
        const toSellTest = 10000000000000

        const retSaleReturn = await bancor.calculateSaleReturn(totalSupplyTest, reserveTest, reserveRatioSellTest, toSellTest)

        expect(
            retSaleReturn.toNumber()
        ).to.be.closeTo(112, 10); // calculated using integration or slava's method
    });


});
