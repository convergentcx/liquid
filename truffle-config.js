'use strict';

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 9545,
      gas: 9000000,
      gasPrice: 5e9,
      network_id: '*'
    }
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
