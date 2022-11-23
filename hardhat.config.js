// required hardhat plugins
// npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai
//
require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.12",
        settings: {},
      },
      {
        version: "0.8.0"
      }
    ]
  },

  paths: {
    contracts: "./contracts",
    artifacts: "./artifacts",
  },
  networks: {

    hardhatfork: {
        chainId: 31337,
        //url: "https://mainnet.infura.io/v3/4cd98623d90d401ca984c02080c6bf72",
        url: "localhost:8545",
      },
    mainnet: {
        chainId: 1,
        url: "https://mainnet.infura.io/v3/4cd98623d90d401ca984c02080c6bf72", // or any other JSON-RPC provider
        accounts: ["0xa3994cf9f5df831441f98cbe07d1dbd4f2b1ac80518a1de7d66e6f7ef2a03a4a"]
      },
      matic: {
        url: 'https://polygon-mainnet.g.alchemy.com/v2/-xVyH7D3cYUoEWpjV1xuaHXQcXL7va-X',
        accounts: ['9b30f5dfe92f581ea1ad4d5d10bb49a746be4abaf39ec163a893414f698a0835'],
      }
    }
};

