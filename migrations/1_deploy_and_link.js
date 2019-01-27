const BancorAdaptor = artifacts.require('BancorAdaptor');
const BancorFormula = artifacts.require('BancorFormula');
const BondedFungibleToken = artifacts.require('BondedFungibleToken');
const ExponentLib = artifacts.require('ExponentLib');
const FixidityLib = artifacts.require('FixidityLib');
const LogarithmLib = artifacts.require('LogarithmLib');
const Migrations = artifacts.require('Migrations');
const SafeMath = artifacts.require('SafeMath');

const deployFixidity = async deployer => {
  await deployer.deploy(FixidityLib);

  await deployer.link(FixidityLib, LogarithmLib);
  await deployer.deploy(LogarithmLib);

  await deployer.link(FixidityLib, ExponentLib);
  await deployer.link(LogarithmLib, ExponentLib);
  await deployer.deploy(ExponentLib);
}

module.exports = async deployer => {
  /// Migrations
  await deployer.deploy(Migrations);

  /// SafeMath
  await deployer.deploy(SafeMath);

  // Bancor Formula
  await deployer.deploy(BancorFormula);

  // Fixidity
  await deployFixidity(deployer);

  // Bancor Adaptor (link)
  await deployer.link(FixidityLib, BancorAdaptor);
  await deployer.link(LogarithmLib, BancorAdaptor);
  await deployer.link(ExponentLib, BancorAdaptor);

  /// BondedFungibleToken
  await deployer.link(SafeMath, BondedFungibleToken);
  await deployer.deploy(BondedFungibleToken);
}
