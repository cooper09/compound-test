
const { ethers } = require('hardhat');
const  {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');

/********************************************************************* */
// utils generic ethers tools for formatting 
const {toBytes32, toString, toWei, toEther, toRound, getTimestamp } = require('./utils');

/********************************************************************* */
const {provider, acct1, acct2, privateKey, signer, account } = require("./accts");
const {logger} = require('./logger');
const timestamp = getTimestamp();

const buySwap = async ( orderId,  wallet, acct ) => {
    console.log("buySwap: ", acct, " orderId: ", orderId );

    //const Router = require('./artifacts/contracts/Router.sol/Router.json');
    const wethArtifact = require('../artifacts/contracts/Weth.sol/Weth.json');
    const daiArtifact = require('../artifacts/contracts/Dai.sol/Dai.json');

    UniswapABI = require("../abis/UniswapRouter.json")

    const wethAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //Mainnet
    const daiAddr = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; //Mainnet

    // WETH contract and balance
    const wethContract = new ethers.Contract( 
        wethAddr,
        wethArtifact.abi,
        wallet
    );

    const daiContract = new ethers.Contract( 
        daiAddr, 
        daiArtifact.abi, 
        wallet );

    //Create UniswapV2 Router contract
    const router = new ethers.Contract( 
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        UniswapABI,
        wallet
    );

/*********************************************************************** */
//Set Up a Uniswap trade...
const chainId = 1;

const dai = await Fetcher.fetchTokenData(chainId, daiAddr );
const weth = WETH[chainId];
const pair = await Fetcher.fetchPairData(dai,weth);
const route = new Route([pair], weth );
console.log("Buy 1 WETH with ", route.midPrice.toSignificant(6)," Dai" );
console.log("Buy 1 DAI with ", route.midPrice.invert().toSignificant(6)," Eth" );

console.log("The ammount of Dai we are selling: ", toWei(route.midPrice.invert().toSignificant(6)) )
let amountEthFromDAI = await router.getAmountsOut(
        toWei(route.midPrice.invert().toSignificant(6)),
        [daiAddr, wethAddr]
    )
    console.log("The ammount of Dai we are selling: ", toWei(route.midPrice.invert().toSignificant(6)) )
    console.log("");
console.log("Amount of Eth from Dai - DAI: ", toEther(amountEthFromDAI[0]));
console.log("Amount of ETH from DAI - ETH: ", toEther(amountEthFromDAI[1]));

const amount = toEther(amountEthFromDAI[0]);
let slippage = toBytes32("0.050");

/************************************************************************* */
    try {
        console.log("create trade object...");
        let amountIn = ethers.utils.parseEther(amount.toString()); //helper function to convert ETH to Wei       
        amountIn = amountIn.toString()
        console.log("Amount (WETH) that goes in: ", toEther(amountIn) )
        const slippageTolerance = new Percent(slippage, "10000"); // 50 bips, or 0.50% - Slippage tolerance

        const trade = new Trade( //information necessary to create a swap transaction.
            route,
            new TokenAmount(weth, amountIn),
            TradeType.EXACT_INPUT
        );  //end trade

        console.log("BuySwap - Swap Eth for Dai trade...");

        //Set up SEND transaction
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
        const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
        const path = [wethAddr, daiAddr]; //An array of token addresses
        const to = acct // should be a checksummed recipient address
        //const to = "0xb12A2AE1735Cc533837EB73D2747e4804471A0b0";
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
        const value = trade.inputAmount.raw*5; //*10; // // needs to be converted to e.g. hex
        const valueHex = await ethers.BigNumber.from(value.toString()).toHexString(); //convert to hex string

       console.log("about to create swap tx...");
       const gasPrice = await ethers.getDefaultProvider().getGasPrice();
       console.log("BuySwap - current gas price: ", toEther(gasPrice));

       let currentNonce = await provider.getTransactionCount(account.address, 'latest')
       console.log("Buyswap current transaction nonce: ",  currentNonce) 

        await logger("BuySwap - orderId: "+ orderId);

        if(!orderId) {
            console.log("swap/buy")
            // cooper s - turn on for production (swap/buy only)
            currentNonce = currentNonce +1;
        }

        if(orderId) {
            console.log("Buy/swap")
            //currentNonce = currentNonce +1;  //turn off for production only

        }

     //currentNonce = currentNonce +1

        const rawTxn = await router.populateTransaction.swapExactETHForTokens(
            amountOutMinHex,
             path, 
             to,
            deadline,
            {
                //gasPrice,
                //value: valueHex,
                value,
                //nonce: provider.getTransactionCount(account.address, 'latest'),
                nonce: currentNonce ,
                //nonce: currentNonce + 1,
            })

            console.log("send trade transaction")

            let sendTxn = (await wallet).sendTransaction(rawTxn)
            let reciept = (await sendTxn).wait()

            //Logs the information about the transaction it has been mined.
            if (reciept) {
                console.log("Buy - Transaction is mined - " + '\n' 
                + "Transaction Hash:", (await sendTxn).hash
                + '\n' + "Block Number: " 
                + (await reciept).blockNumber + '\n' 
                + "Navigate to whereever to see Buy Transaction: "  
                + (await sendTxn).hash, "to see your Buy transaction")

                let timestamp = getTimestamp();
                const log = await logger("logger "+timestamp+" - BuySwap - buy Transfer hash: "+ (await sendTxn).hash );
            } else {
                console.log("Buy - Error submitting transaction: ", orderId);
                let timestamp = getTimestamp();
                await logger("logger "+timestamp+" Buy - Error submitting transaction: "+ orderId);
                process.exit(0);
            }//end iffy

            const contractDaiWallet = daiContract.connect(wallet);
            await contractDaiWallet.balanceOf(acct)
                .then((bal) => {
                    console.log(wallet.address, " current Receiver DAI balance: ", toEther(bal) )
                })
                //check for transfer EVENT
  
    } catch(e) {
        console.log("Buy Error: ", e.message);
        let timestamp = getTimestamp();
        await logger(timestamp + "Buy did not go thru: ", e.message)
        process.exit(0);
    }
    return true;
}//end buySwap


module.exports.buySwap = buySwap;

//const buySwap = async ( orderId,  wallet, acct ) => {
//buySwap(00,account, acct2);
