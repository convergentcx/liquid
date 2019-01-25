const BondedFungibleToken = artifacts.require('BondedFungibleToken');

module.exports = async deployer => {
  /// Migrations
  await deployer.deploy(BondedFungibleToken);
}
