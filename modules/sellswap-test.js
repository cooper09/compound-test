
const { ethers } = require('hardhat');
const  {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');
const { BigNumber } = require('ethers');
/***********************************************************************************/ 

// set up prvider, primary and secondary addresses
const {provider, acct1, acct2, privateKey, signer, account } = require("./accts");

/********************************************************************* */

// utils generic ethers tools for formatting 
const {toBytes32, toString, toWei, toEther, toRound, getTimestamp } = require('./utils');

/********************************************************************* */

// Set up contracts 
const { daiAddr, wethAddr, wethArtifact, daiArtifact,daiContract, router } = require("./contracts")

/***************************************************************************** */
const {logger} = require('./logger');

const sellSwap = async ( orderId, wallet, acct, provider ) => {
    console.log("sell me baby....")

    // set up pair trade in Uniswap
    const chainId = 1;
    const dai = await Fetcher.fetchTokenData(chainId, daiAddr );
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(dai,weth);
    const route = new Route([pair], dai );

// check Dai balance of each account.
    const daiBalSender  = await daiContract.balanceOf(acct1);
    const daiBalRcvr  = await daiContract.balanceOf(acct2);
    console.log("Dai balance Sender: ", toEther(daiBalSender) , " Dai Balance Receiver: ", toEther(daiBalRcvr));

    let amountEthFromDAI = await router.getAmountsOut(
        // cooper s - this is where we decide to use the Dai balance of the receiver 
        //  or the Sender to purchase the ETH. 
        //daiBalSender,
        daiBalRcvr,
        [daiAddr, wethAddr]
    )
    const amountDaiIn  = amountEthFromDAI[0];
    let amountEthOut = amountEthFromDAI[1];

    console.log("SellSwap - Eth amount for Dai: ", toEther(amountEthFromDAI[0]) );
    console.log("SellSwap - For ", toEther(amountDaiIn), " Dai receive ", toEther(amountEthOut), " of ETH"  );

    let slippage = toBytes32("0.050");
    const slippageTolerance = new Percent(slippage, "10000");

    //set up trade inpputs Dai for Eth
    try {
        const trade = new Trade( //information necessary to create a swap transaction.
        route,
        new TokenAmount(dai, amountDaiIn),
        TradeType.EXACT_INPUT
    ); //end trade

    const value = trade.inputAmount.raw; // // needs to be converted to e.g. hex
    const valueHex = await ethers.BigNumber.from(value.toString()).toHexString();
    console.log("value: ", toEther(value.toString()), " valueHex: ", valueHex );

    const approveTx = require("./approve-tx")
        await approveTx.approve(daiContract, account, valueHex )
        .then (() => {
            console.log("amount approved...")
        })//end approval

    //set up actual swap
        try {
            //console.log("SellSwap - amount to transfer: ", toEther(amountEthOut ));
            //console.log("get jiggy  with it: ", ethers.utils.formatUnits(amountEthOut))
            const routerWithWallet = router.connect(wallet); 
            const decimals = 18;
            currentNonce = await provider.getTransactionCount(wallet.address, 'latest');
            console.log("SellSwap = Current nonce: ", currentNonce)

            const gasPrice = await ethers.getDefaultProvider().getGasPrice();

            amountEthOut = BigNumber.from(amountEthOut.toString());
            let amountEth = amountEthOut.div(10)

            console.log("The amount of Eth we expect to get: ", toEther(amountEth.toString()) )

            const tx = await wallet.sendTransaction({
                to: acct2,
                value: amountEth,
                //value,
                nonce: currentNonce,
            })

            console.log("SellSwap - Sell Transfer hash: ",tx.hash )
            const timestamp = getTimestamp();
            const log = await logger("logger "+timestamp +" - SellSwap - Sell transaction complete: "+ tx.hash );

        } catch(e) {
            console.log("Failed during swap: ", e.message )
        }//end inner try
    } catch (e) {
        console.log("SellSwap failed: ", e.message )
        process.exit(0)
    }//end try

return true;
//process.exit(0)
}//end sellSwap

module.exports.sellSwap = sellSwap;

//sellSwap( true, account, acct2, provider);
