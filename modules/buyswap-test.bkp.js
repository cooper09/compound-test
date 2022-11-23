
const { ethers } = require('hardhat');
const  {ChainId, Fetcher, WETH, Pair, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');

/********************************************************************* */
// utils generic ethers tools for formatting 
const {toBytes32, toString, toWei, toEther, toRound, getTimestamp } = require('./utils');

/********************************************************************* */
const {provider, acct1, acct2, privateKey, signer, account } = require("./accts");
const {logger} = require('./logger');
const { BigNumber } = require('ethers');
const timestamp = getTimestamp();

const buySwap = async ( orderId,  wallet, acct ) => {
    console.log("buySwap: ", acct, " orderId: ", orderId );

    //const Router = require('./artifacts/contracts/Router.sol/Router.json');
    const wethArtifact = require('../artifacts/contracts/Weth.sol/Weth.json');
    const daiArtifact = require('../artifacts/contracts/Dai.sol/Dai.json');

    UniswapABI = require("../abis/UniswapRouter.json")

    const wethAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //Mainnet
    const daiAddr = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; //Mainnet
    const decimals = 18;

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

const Big = require('big.js');

let wethBal = await provider.getBalance(acct2);
console.log("Acct2 ETH balance: ", wethBal );

x = new BigNumber.from(wethBal );
//console.log("bignumber balance: ", x )

console.log("to string: ", toEther(x.toString()) );
console.log("9 places: ", toEther(x.mul(100000000)) )
console.log("to ;number ", Math.round(toEther(x.mul(10000000))))

let testBal = Math.round(toEther(x.mul(1000000000)))
//let testBal = Math.round(toEther(x.toString()))
console.log ("rounded off balance: ",testBal )

//WETH to DAi
const dai = await Fetcher.fetchTokenData(chainId, daiAddr );
const weth = WETH[chainId];
const pair = await Fetcher.fetchPairData(dai,weth);
const route = new Route([pair], weth );

let amountEthFromDAI = await router.getAmountsOut(
    toWei(route.midPrice.invert().toSignificant(6)),
    //toWei(route.midPrice.toSignificant(6)),
    [daiAddr, wethAddr]
)

console.log("amountEthFromDAI - amount of Dai: ", amountEthFromDAI[0]," for one ETH");
console.log("amountEthFromDAI - amount of ETH: ", amountEthFromDAI[1]," for one DAI");

console.log("Amount of Dai for 1 Eth in ether - DAI: ", toEther(amountEthFromDAI[0]));
console.log("Amount of Eth for 1 DAI in ether- ETH: ", toEther(amountEthFromDAI[1]));

let amount = amountEthFromDAI[0]
console.log("amount: ", toEther(amount) )

bigAmt = BigNumber.from(amount)
console.log("calculaed amount: ", bigAmt.toString() )

// cooper s - 0.000631797 / 0.117010678703899778 = 0.00539948154 = 8/9 Dai

amount = bigAmt.div(testBal)
console.log("Our Final Amount: ", amount.toString() )

let finalAmt =  toEther(amount.toString())*1000000000;
console.log("Our Final Amount of Ether to buy Dai: ", finalAmt.toString() )

let slippage = toBytes32("0.050");

//let amountIn = ethers.utils.parseEther(amount.toString()); //helper function to convert ETH to Wei       
//amountIn = amountIn.toString()
amountIn = finalAmt.toString();
console.log("Amount (WETH) that goes in: ", amountIn )
const slippageTolerance = new Percent(slippage, "10000");

//cooper s - keep an eye on this bad boy
amountIn = ethers.utils.parseUnits(amountIn, decimals);

try {
    console.log("Do your stuff...");

    const trade = new Trade( //information necessary to create a swap transaction.
    route,
    new TokenAmount(weth, amountIn),
    TradeType.EXACT_INPUT
);  //end trade

console.log("BuySwap - Swap Eth for Dai trade: ");
        //Set up SEND transaction
        const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw; // needs to be converted to e.g. hex
        const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();
        const path = [wethAddr, daiAddr]; //An array of token addresses
        const to = acct2 // should be a checksummed recipient address
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
        const value = trade.inputAmount.raw; //*10; // // needs to be converted to e.g. hex
        const valueHex = await ethers.BigNumber.from(value.toString()).toHexString();
        
        console.log("Hex value: ", valueHex )

        const gasPrice = await ethers.getDefaultProvider().getGasPrice();
        let currentNonce = await provider.getTransactionCount(account.address, 'latest')
        console.log("Buyswap current transaction nonce: ",  currentNonce) 

        const rawTxn = await router.populateTransaction.swapExactETHForTokens(
            amountOutMinHex,
             path, 
             to,
            deadline,
            {
                value: valueHex,
                //value,
                nonce: currentNonce ,
            })


            let sendTxn = (await wallet).sendTransaction(rawTxn)
            let receipt = (await sendTxn).wait()

            if (receipt) {
                console.log("Buy - Transaction is mined - " + '\n' 
                + "Transaction Hash:", (await sendTxn).hash
                + '\n' + "Block Number: " 
                + (await receipt).blockNumber + '\n' 
                + "Navigate to whereever to see Buy Transaction: "  
                + (await sendTxn).hash, "to see your Buy transaction")
            }

} catch(e) {
    console.log("Something went wrong: ", e.message )
}//end try/catch


const contractDaiWallet = daiContract.connect(wallet);
await contractDaiWallet.balanceOf(acct2)
    .then((bal) => {
        console.log(wallet.address, " current Receiver DAI balance: ", toEther(bal) )
    })

process.exit(0)
}//end buySwap


module.exports.buySwap = buySwap;

//const buySwap = async ( orderId,  wallet, acct ) => {

//buySwap(false,account, acct2);
