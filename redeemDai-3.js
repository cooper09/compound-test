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
const cTokenAbiJson = require("./abis/cTokenAbi2.json");

const cTokenContract = new ethers.Contract(cTokenContractAddress, cTokenAbiJson, account)

//Get Dai contract
const underlyingContractAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const erc20AbiJson = require('./abis/ERC20.json');
const underlyingContract = new ethers.Contract(underlyingContractAddress, erc20AbiJson, account);

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
    // cooper s - account is our universal wallet)
    const myWalletAddress = account.address;

    const underlyingContractAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

    const assetName = 'DAI'; // for the log output lines
    const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract

    // redeem (based on cTokens)
  console.log(`Exchanging all c${assetName} based on cToken amount...`, '\n');

  /* cooper s - original transaction */
  /***************************************/

// Mainnet Contract for the underlying token https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f

  // See how many underlying ERC-20 tokens are in my wallet before we supply
  const tokenBalance = await underlyingContract.callStatic.balanceOf(myWalletAddress) / 1e18;
  console.log(`My wallet's ${assetName} Token Balance:`, tokenBalance);

  let cTokenBalance = +(await cTokenContract.callStatic.balanceOf(myWalletAddress)) / 1e8;
  console.log(`My wallet's c${assetName} Token Balance:`, cTokenBalance);

  console.log(`Exchanging all c${assetName} based on cToken amount...`, '\n');

  const gasPrice = await provider.getGasPrice();
  const getCode =  await provider.getCode('0x5d3a536e4d6dbd6114cc1ead35777bab948e3643')
 // console.log("code exists: ", getCode )

  // cooper s - the redeem I'm trying to get to work....
  //tx = await cTokenContract.redeem(cTokenBalance * 1e8);

      /*
const tx = {
    from: account.address,
    to: acct2, 
   // value: ethers.utils.parseUnits('0.002', 'ether'),
   //value: ethers.utils.parseUnits(balance.toString(), 'ether'),
    gasLimit: ethers.utils.hexlify(100000), //100 gwei
    nonce: provider.getTransactionCount(account.address, 'latest')
    }//end 
*/

    //tx = await cTokenContract.callStatic.redeem(parseInt(cTokenBalance) * 1e8, { 
    tx = await cTokenContract.redeem(cTokenBalance * 1e8, {
      gasLimit: 5000000, 
      gasPrice,
      nonce: provider.getTransactionCount(account.address, 'latest')
      });
    //*/
    await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain
  
await logBalances();

process.exit(0);
}//end start

/***********************************************************************************/ 

start().catch (e => {
    console.log("redeemDai Error: ", e.message )
});