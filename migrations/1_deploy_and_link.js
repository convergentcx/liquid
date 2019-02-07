const DoubleCurveToken = artifacts.require('DoubleCurveToken');
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

  // Fixidity
  // await deployFixidity(deployer);

  // Bancor Adaptor (link)
  // await deployer.link(FixidityLib, BancorAdaptor);
  // await deployer.link(LogarithmLib, BancorAdaptor);
  // await deployer.link(ExponentLib, BancorAdaptor);

  /// DoubleCurveToken
  // await deployer.link(ExponentLib, DoubleCurveToken);
  // await deployer.link(FixidityLib, DoubleCurveToken);
  await deployer.link(SafeMath, DoubleCurveToken);
  await deployer.deploy(DoubleCurveToken);
}
