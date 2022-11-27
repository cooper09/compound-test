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
    console.log("network id: ", networkAddr );

    /***************************************************** */  
    // Main Net Contract for cETH (the supply process is different for cERC20 tokens)
const contractAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
const abiJson = './abis/cTokenbi.json' ;
//const cEthContract = new web3.eth.Contract(abiJson, contractAddress);

    const cEthContract = new ethers.Contract(contractAddress, abiJson, account);
    let cTokenBalance = 10;
    const myWalletAddress = account.address;

    console.log('Exchanging all cETH based on cToken amount...', '\n');
/*
    await cEthContract.callStatic.redeem(cTokenBalance * 1e8).send({
        from: myWalletAddress,
        gasLimit: ethers.utils.hexlify(100000), //100 gwei,
        gasPrice: ethers.utils.hexlify(20000000000), // use ethgasstation.info (mainnet only)
    });
*/
    tx = await cEthContract.callStatic.redeem(parseInt(cTokenBalance) * 1e8)
        .then(result => {
            console.log("redeem result: ", result )
        })
    //await tx.wait(1);

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

    await logBalances();

    process.exit(0);
}

/***********************************************************************************/ 

start().catch (e => {
    console.log("redeemDai Error: ", e.message )
});