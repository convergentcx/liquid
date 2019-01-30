# Liquid

Liquid tokens for artists and creators.

## What it is

The Convergent Beta platform allows creators to launch tokens that are backed by
an automated market maker (also known as a bonding curve). This means that the
tokens are liquid right away without any reliance on third-party exchanges or
orderbooks. When consumers buy tokens from these accounts a portion of the tokens
spent will go directly to the creator, while another portion is reserved in the
contract to use for future sells. The portion that is sent directly is configurable
by the creator when they create their token. Different portions can be used for 
different situations.

Ex. 1
-----

 - Freelancers who use this platform as a way to tokenize an hour of 
   their work may only wish to specify 10% is sent to them directly,
   while they recieve the other 90% when the token is redeemed. 
 - Artists who use the platform to tokenize their services or creations
   may want to set the portion sent to them directly at 50% since they
   use the platform to continually raise funds. This would mean that
   investors must wait longer before they see a return on an artist.
 - Campaigns that use the platform may want to be sent as much as
   90% of the funds directly. This is because they use it for money
   they need to support their cause, while the investment aspect is
   something of a side effect.

## Upgradeability

We use the ZeppelinOS contracts to make it so that the `Account` contracts
deployed through our platform can be upgraded at a later date. This is 
necessary because the `Account` represents token balances and holds value,
but the logic may change in the future. Using the `AdminUpgradeabilityProxy`
the contract logic may be upgraded at a later date only by the _user_. The
one caveat is that only the admin to the ConvergentBeta contract can set
the logic contract that can be upgraded to. The next release, we plan to
have a logic forwarder which will always point at the latest logic contract,
allowing users who do not wish to manually upgrade to opt-in to automated
upgrades handled by the Convergent admins.

## Bonding Curves

The `BancorFormula` is used as the implementation which calculates the price
function of the token. Originally, we wanted to implement our own contracts 
which used an integral method for discovering price, but due to the lack of
support for fixed point numbers in Solidity, this was really hard to do. We
were able to find a point using the `Fixidity` library which mocks fixed point
using the solidity integer types but we found that the precision loss was higher
than if we used `BancorFormula`. The `BancorFormula` also turns out to be more
gas efficient than using the fixed point library to accomplish the same thing.
For those curious, they can look at the archived `BancorAdaptor` contract that
is kept in this repo, in case we ever want to try it again. But we don't think
we will.

## Front-running 

Until we implement the next version of our contracts which will use batched
transactions to mitigate front running to the best extent currently known
on Ethereum, these contracts mitigate front-running by using a gas price 
oracle and `maxSlippage` parameters. The gas price oracle sets a max gas price
that is allowed to `buy` or `sell` from the contracts. This means that the 
possibility of anyone but miners to front-run is reduced greatly, as long
as users send the max gas price. We plan to set this max gas price dynamically
to the state of the network. The `maxSlippage` is used so that if the returned
amount of tokens or reserve has slipped more than expect, the user will be
reverted instead. In most cases, we think that these are good enough to
prevent front-running until we have implemented batch transactions and thought
about the UX hurdles that those introduce.

## License

APGL-3.0 Convergent
