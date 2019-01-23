const ExponentLib = artifacts.require('ExponentLib');
const FixidityLib = artifacts.require('FixidityLib');
const LogarithmLib = artifacts.require('LogarithmLib');
const Migrations = artifacts.require('Migrations');
const Polynomial = artifacts.require('Polynomial');

module.exports = async deployer => {
  /// Migrations
  await deployer.deploy(Migrations);

  /// FixidityLib
  await deployer.deploy(FixidityLib);

  /// LogarithmLib
  await deployer.link(FixidityLib, LogarithmLib);
  await deployer.deploy(LogarithmLib);

  /// ExponentLib
  await deployer.link(FixidityLib, ExponentLib);
  await deployer.link(LogarithmLib, ExponentLib);
  await deployer.deploy(ExponentLib);

  /// Polynomial
  await deployer.link(FixidityLib, Polynomial);
  await deployer.link(LogarithmLib, Polynomial);
  await deployer.link(ExponentLib, Polynomial);
  await deployer.deploy(Polynomial, 1, 1, 1, 1);
}
