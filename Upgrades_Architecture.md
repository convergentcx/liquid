# Upgrades Architecture

## ConvergentBeta

`ConvergentBeta.sol` is the top level contract which is itself upgradeable.
It holds a reference to a `baseAccount` implementation which it will
use to 