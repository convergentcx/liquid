const BancorFormula = artifacts.require('BancorFormula');
const BondedFungibleToken = artifacts.require('BondedFungibleToken');
const Migrations = artifacts.require('Migrations');
const SafeMath = artifacts.require('SafeMath');

module.exports = async deployer => {
  /// Migrations
  await deployer.deploy(Migrations);

  /// SafeMath
  await deployer.deploy(SafeMath);

  await deployer.deploy(BancorFormula);

  /// BondedFungibleToken
  await deployer.link(SafeMath, BondedFungibleToken);
  await deployer.deploy(BondedFungibleToken);
}
