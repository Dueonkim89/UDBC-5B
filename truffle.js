// Allows us to use ES6 in our migrations and tests.
require('babel-register');

//import menonmic phrase
const { menonmic } = require('./menonmic');

// Edit truffle.config file should have settings to deploy the contract to the Rinkeby Public Network.
// Infura should be used in the truffle.config file for deployment to Rinkeby.

const HDWalletProvider = require("truffle-hdwallet-provider");


module.exports = {
  networks: {
    ganache: {
      host: '127.0.0.1',
      port: 9545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
  		provider: function() {
  			return new HDWalletProvider(menonmic, 'https://rinkeby.infura.io/v3/a0ab6d59647647dc9fda0824c7c9f107')
  		},
  		network_id: '1',
  		gas: 4500000,
  		gasPrice: 10000000000,
  	}
  },
  compilers: {
    solc: {
      version: "0.4.24",
    },
  }
}
