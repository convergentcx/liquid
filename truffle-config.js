'use strict';

const HDWalletProvider = require('truffle-hdwallet-provider');
const NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker")

const { M_PK, PK, PK2 } = process.env;
// console.log(pk);

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 9545,
      gas: 9000000,
      gasPrice: 5e9,
      network_id: '*'
    },
    rinkeby: {
      provider: () => {
        const wallet = new HDWalletProvider([PK, PK2], 'https://rinkeby.infura.io/v3/7121204aac9a45dcb9c2cc825fb85159', 0, 2)
        const nonceTracker = new NonceTrackerSubprovider();
        wallet.engine._providers.unshift(nonceTracker);
        nonceTracker.setEngine(wallet.engine);
        return wallet;
      },
      network_id: '4',
      gas: 5000000,
      gasPrice: 3e9,
    },
    mainnet: {
      provider: () => {
        const wallet = new HDWalletProvider([M_PK], 'https://neatly-tolerant-coral.quiknode.io/73b04107-89ee-4261-9a8f-3c1e946c17b2/CyYMMeeGTb-EeIBHGwORaw==/');
        const nonceTracker = new NonceTrackerSubprovider();
        wallet.engine._providers.unshift(nonceTracker);
        nonceTracker.setEngine(wallet.engine);
        return wallet;
      },
      network_id: '1',
      gas: 4000000,
      gasPrice: 6e9,
      timeoutBlocks: 1000000, // dont timeout
    },
  },
  compilers: {
    solc: {
      version: "0.4.24",
      // docker: true,
      settings: {
       optimizer: {
         enabled: false,
         runs: 200
       },
       evmVersion: "byzantium",
      }
    }
  }
};
