const { IpcProvider } = require("@ethersproject/providers");
const { Wallet } = require("ethers");
const { ethers } = require("hardhat");
const dotenv = require('dotenv').config(); 

//const rpcURL = 'http://localhost:8545';
//const provider = new ethers.providers.JsonRpcProvider( rpcURL);

/***********************************************************************************/ 
// utils generic ethers tools for formatting 
const {toBytes32, toString, toWei, toEther, toRound } = require('./modules/utils');

/***********************************************************************************/ 
// set up primary and secondary addresses
const {provider, acct1, acct2, testAcct, privateKey, signer, account } = require("./modules/accts");

/***********************************************************************************/ 

const test_send_ether = async () => {
    
    console.log("test_send_ether: ");

        const gasPrice = await provider.getGasPrice();
        console.log("gas price: ", ethers.utils.formatEther(gasPrice))

        const tx = {
            from: account.address,
            to: acct1, 
            //to: testAcct,
            //value: ethers.utils.parseUnits('0.07745513411356', 'ether'),
            value: ethers.utils.parseUnits('1', 'ether'),
            //value: ethers.utils.parseUnits(valueStr, 'ether'),
            gasPrice,
            gasLimit: ethers.utils.hexlify(100000), //100 gwei
            nonce: provider.getTransactionCount(account.address, 'latest')
            }//end 

        try {
            const transaction = await account.sendTransaction(tx)
            console.log("transaction: ", transaction.nonce)
            console.log("transaction hash: ", transaction.hash);
            } catch (e) {
            console.log("Send transaction failed: ", e.message);
            process.exit(1);
        }
       const ethBalbalance = await provider.getBalance(acct2)
        .then((bal) => {
            console.log("Receiver ETH balance after trade: ", toEther(bal) )
        }) 
 }//end test_send_ether

 module.exports.test_send_ether = test_send_ether;

 test_send_ether();
