const { ethers } = require('ethers');
//const { ethers } = require('hardhat');
const dotenv = require('dotenv').config();

/***********************************************************************************/ 

// set up prvider, primary and secondary addresses
const {toBytes32, toString, toWei, toEther, toRound } = require('./modules/utils');
const {provider, acct1, acct2, privateKey, signer, account } = require("./modules/accts");

const { logBalances } = require("./modules/logBalances");

/***********************************************************************************/ 
// Mainnet Contract for cDAI (https://compound.finance/docs#networks)
const cTokenContractAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643';
const cTokenAbiJson = require("./abis/cTokenAbi.json");
const cTokenContract = new ethers.Contract(cTokenContractAddress, cTokenAbiJson, account)

//Get Dai contract
const underlyingContractAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const erc20AbiJson = require('./abis/ERC20.json');
const underlyingDaiContract = new ethers.Contract(underlyingContractAddress, erc20AbiJson, account);

//Get USDC contract
const underlyingUSDCContractAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const underlyingUSDCContract = new ethers.Contract(underlyingUSDCContractAddress, erc20AbiJson, account);

const assetName = 'DAI'; // for the log output lines
const asset2Name = 'USDC'; // for the log output lines
const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract
const underlyingUSDCDecimals = 6; // Number of decimals defined in this ERC20 token's contract

/***********************************************************************************/ 
const start = async () => {
    console.log("Redeem me, baby...");

    const networkAddr = await provider.getNetwork();
    console.log("network id: ", networkAddr )

/********************************************************************** */
    let cTokenBalance = +(await cTokenContract.callStatic.balanceOf(account.address)) / 1e8;
    console.log(`My wallet's c${assetName} Token Balance:`, cTokenBalance);

    let erCurrent = await cTokenContract.callStatic.exchangeRateCurrent();
    let exchangeRate = +erCurrent / Math.pow(10, 18 + underlyingDecimals - 8);
    console.log(`Current exchange rate from c${assetName} to ${assetName}:`, exchangeRate, '\n');
  
    console.log(`Redeeming the c${assetName} for ${assetName}...`);

    await logBalances();

    // redeem (based on cTokens)
  console.log(`Exchanging all c${assetName} based on cToken amount...`, '\n');
  //tx = await cTokenContract.redeem(cTokenBalance * 1e8);
  tx = await cTokenContract.redeem(parseInt(cTokenBalance) * 1e8);
  await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain

await logBalances();

process.exit(0);
}

/***********************************************************************************/ 

start();