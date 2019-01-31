'use strict';

const HDWalletProvider = require('truffle-hdwallet-provider');

const { PK, PK2 } = process.env;
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
      provider: () => new HDWalletProvider([PK, PK2], 'https://rinkeby.infura.io/v3/7121204aac9a45dcb9c2cc825fb85159', 0, 2),
      network_id: '4',
      gas: 5000000,
      gasPrice: 3e9,
    },
  },
  compilers: {
    solc: {
      version: "0.4.25",
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
