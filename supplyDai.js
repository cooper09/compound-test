const { ethers } = require('ethers');
//const { ethers } = require('hardhat');
const dotenv = require('dotenv').config();

/***********************************************************************************/ 

// set up prvider, primary and secondary addresses
const {toBytes32, toString, toWei, toEther, toRound } = require('./modules/utils');
const {provider, acct1, acct2, privateKey, signer, account } = require("./modules/accts");

const { logBalances } = require("./modules/logBalances");

let config = require("./config");

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
    console.log("Compound me, baby...");

    const networkAddr = await provider.getNetwork();
    console.log("network id: ", networkAddr )

    await logBalances();

      // See how many underlying ERC-20 tokens are in my wallet before we supply
  const daiBalance = await underlyingDaiContract.callStatic.balanceOf(account.address) / 1e18;
  console.log(`Supply - My wallet's ${assetName} Balance:`, daiBalance);

  const usdcBalance = await underlyingUSDCContract.callStatic.balanceOf(account.address) / 1e6;
  console.log(`My wallet's ${asset2Name} Balance:`,  usdcBalance );

  const underlyingUSDCToSupply = 10 * Math.pow(10, underlyingUSDCDecimals);
  console.log("underlying USDC supply: ", underlyingUSDCToSupply );

  //coper s - select the amount you want to supply from here. Be careful when you're on mainnet
    //const underlyingDaiToSupply = 1 * Math.pow(10, underlyingDecimals); //supply 1 Dai
    const underlyingDaiToSupply = 10 * Math.pow(10, underlyingDecimals); //supply 10 Dai
    //const underlyingDaiToSupply = 50 * Math.pow(10, underlyingDecimals);  //supply 50 Dai
    //const underlyingDaiToSupply = 100 * Math.pow(10, underlyingDecimals);  //supply 100 Dai
    console.log("underlying Dai supply: ", underlyingDaiToSupply / 1e6);

  // Tell the contract to allow 10 tokens to be taken by the cToken contract
  let tx = await underlyingDaiContract.approve(
    cTokenContractAddress, underlyingDaiToSupply.toString()
  );
  await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain

  console.log(`${assetName} contract "Approve" operation successful.`);
  console.log(`Supplying ${assetName} to the Compound Protocol...`, '\n');

    // Mint cTokens by supplying underlying tokens to the Compound Protocol
    // cooper s - tx to actually supply the dai to compount
    
    tx = await cTokenContract.mint(underlyingDaiToSupply.toString());
    await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain
  
    console.log(`c${assetName} "Mint" operation successful.`, '\n');

    const bal = await cTokenContract.callStatic.balanceOfUnderlying(account.address);
    const balanceOfUnderlying = +bal / Math.pow(2, underlyingDecimals);
  
    console.log(`${assetName} supplied to the Compound Protocol:`, balanceOfUnderlying / 1e18, '\n');

    let cTokenBalance = +(await cTokenContract.callStatic.balanceOf(account.address)) / 1e8;
    console.log(`My wallet's c${assetName} Token Balance:`, cTokenBalance);

    let erCurrent = await cTokenContract.callStatic.exchangeRateCurrent();
    let exchangeRate = +erCurrent / Math.pow(10, 18 + underlyingDecimals - 8);
    console.log(`Current exchange rate from c${assetName} to ${assetName}:`, exchangeRate, '\n');
  
    console.log(`Redeeming the c${assetName} for ${assetName}...`);

    await logBalances();
/*
    // redeem (based on cTokens)
  console.log(`Exchanging all c${assetName} based on cToken amount...`, '\n');
  //cooper s - shouldn't these be turned on
  //tx = await cTokenContract.redeem(cTokenBalance * 1e8);
  tx = await cTokenContract.redeem(parseInt(cTokenBalance) * 1e8, { gasLimit: 5000000  });
  await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain
*/
    
    process.exit(0);
}

/***********************************************************************************/ 

start();