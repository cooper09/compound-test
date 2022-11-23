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
const myWalletAddress = account.address;
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

// Mainnet address for a cToken (like cDai, https://compound.finance/docs#networks)
const cTokenAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'; // cDai
const cToken = new ethers.Contract(cTokenAddress, cErcAbi, account);
const assetName = 'DAI'; // for the log output lines
const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract

const logBalances = () => {
    return new Promise(async (resolve, reject) => {
      let myWalletEthBalance = await provider.getBalance(myWalletAddress) / 1e18;
      let myWalletCTokenBalance = await cToken.callStatic.balanceOf(myWalletAddress) / 1e8;
      let myWalletUnderlyingBalance = await underlying.callStatic.balanceOf(myWalletAddress) / Math.pow(10, underlyingDecimals);
  
      console.log("Borrow - Compound Wallet's  ETH Balance:", myWalletEthBalance);
      console.log(`Borrow - Compound Wallet's c${assetName} Balance:`, myWalletCTokenBalance);
      console.log(`Borrow - Compound Wallet's  ${assetName} Balance:`, myWalletUnderlyingBalance);

      let receiverEthBalance = await provider.getBalance(acct1) / 1e18;
      console.log("\nBorrow - Receiver Wallet's  ETH Balance:", receiverEthBalance);

      resolve();
    });
  };

/***********************************************************************************/ 
const start = async () => {    console.log("Repay loan...");

    const networkAddr = await provider.getNetwork();
    console.log("network id: ", networkAddr );

    await logBalances();


// cooper s - start repay here...
    console.log(`Now repaying the borrow...`);

    const ethToRepay = '0.001';

    const repayBorrow = await cEth.repayBorrow({
      value: ethers.utils.parseEther(ethToRepay.toString())
    });
    const repayBorrowResult = await repayBorrow.wait(1);
  
    failure = repayBorrowResult.events.find(_ => _.event === 'Failure');
    if (failure) {
      const errorCode = failure.args.error;
      console.error(`repayBorrow error, code ${errorCode}`);
      process.exit(1);
    }

    console.log(`\nBorrow repaid.\n`);
    await logBalances();

    process.exit(0);

}//end start

/***********************************************************************************/ 

start().catch (e => {
    console.log("repayEth Error: ", e.message )
});