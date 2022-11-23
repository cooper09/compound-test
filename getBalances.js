const { ethers } = require('ethers');
//const { ethers } = require('hardhat');
const dotenv = require('dotenv').config();

const Compound = require('@compound-finance/compound-js');

/***********************************************************************************/ 

// set up prvider, primary and secondary addresses
const {toBytes32, toString, toWei, toEther, toRound } = require('./modules/utils');
const {provider, acct1, acct2, privateKey, signer, account } = require("./modules/accts");

let config = require("./config");
/******************************************************************** */
const {
    cEthAbi,
    comptrollerAbi,
    priceFeedAbi,
    cErcAbi,
    erc20Abi,
  } = require('./contracts/contracts.json');

  // Mainnet Contract for cETH
const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
const cEth = new ethers.Contract(cEthAddress, cEthAbi, account);

// Mainnet Contract for Compound's Comptroller
const comptrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';
const comptroller = new ethers.Contract(comptrollerAddress, comptrollerAbi, account);

// Mainnet Contract for the Open Price Feed
const priceFeedAddress = '0x6d2299c48a8dd07a872fdd0f8233924872ad1071';
const priceFeed = new ethers.Contract(priceFeedAddress, priceFeedAbi, account);

// Mainnet address of underlying token (like DAI or USDC)
const underlyingAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // Dai
const underlying = new ethers.Contract(underlyingAddress, erc20Abi, account);

const underlyingUSDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
const underlyingUSDC = new ethers.Contract(underlyingUSDCAddress, erc20Abi, account);

// Mainnet address for a cToken (like cDai, https://compound.finance/docs#networks)
const cTokenAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'; // cDai
const cToken = new ethers.Contract(cTokenAddress, cErcAbi, account);
const assetName = 'DAI'; // for the log output lines
const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract

// Mainnet address for a cUSDC (like cDai, https://compound.finance/docs#networks)
const cUSDCAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'; // cDai
const cUSDC = new ethers.Contract(cUSDCAddress, cErcAbi, account);
const assetUSDCName = 'USDC'; // for the log output lines
const underlyingUSDCDecimals = 6; // Number of decimals defined in this ERC20 token's contract

const myWalletAddress = account.address;
const logBalances = () => {
    return new Promise(async (resolve, reject) => {
      let myWalletEthBalance = await provider.getBalance(myWalletAddress) / 1e18;
      let myWalletCTokenBalance = await cToken.callStatic.balanceOf(myWalletAddress) / 1e8;
      let myWalletUnderlyingBalance = await underlying.callStatic.balanceOf(myWalletAddress) / Math.pow(10, underlyingDecimals);

      let myWalletUnderlyingUSDCBalance = await underlyingUSDC.callStatic.balanceOf(myWalletAddress) / Math.pow(10, underlyingUSDCDecimals);
      
      console.log("Compoune Wallet's  ETH Balance:", myWalletEthBalance);
      console.log(`Compoune Wallet's c${assetName} Balance:`, myWalletCTokenBalance);
      console.log(`Compoune Wallet's  ${assetName} Balance:`, myWalletUnderlyingBalance);
      console.log(`Compoune Wallet's  ${assetUSDCName} Balance:`, myWalletUnderlyingUSDCBalance);

      resolve();
    });
  };

/******************************************************************** */

const start = async () =>{ 

    console.log("getbalances...");
    const networkAddr = await provider.getNetwork();
    console.log("network id: ", networkAddr );

    let bal1 = await Compound.eth.getBalance(acct1, provider )
    console.log(`Account 1 Compoound Eth balance: ${acct1} `, bal1 /1e18)

    let bal2 = await Compound.eth.getBalance(acct2, provider )
    console.log(`Account 2 Compoound Eth balance: ${acct2} `, bal2 /1e18);

    await logBalances();

    process.exit(0);

}//end start

/***********************************************************************************/ 

start().catch (e => {
    console.log("GetBalance Error: ", e.message )
});