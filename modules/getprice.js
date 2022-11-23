
const { ethers } = require('hardhat');
const  {ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');

/********************************************************************* */

// utils generic ethers tools for formatting 
const {toBytes32, toString, toWei, toEther, toRound } = require('./utils');

/********************************************************************* */

//accounts and provider
const {provider, acct1, acct2, privateKey, signer, account } = require("./accts");

/********************************************************************* */

// Set up contracts 
const {wethArtifact, daiArtifact,daiContract,daiAddr, wethAddr, router } = require("./contracts")

/********************************************************************* */

const getPrice = async () => {
    console.log("Getprice")

    const chainId = 1;
    const [ownerSigner] = await ethers.getSigners();
    //console.log("getPrice - owner: ", [ownerSigner]);
    try {
    //console.log("Uniswap contract: ", uniswap )
    const dai = await Fetcher.fetchTokenData(chainId, daiAddr);
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(dai,weth);
    const route = new Route([pair], weth );
    console.log("GetPrice - Buy WETH token with ", route.midPrice.toSignificant(6), " DAI" );
    console.log("GetPrie - Buy DAI token with ", route.midPrice.invert().toSignificant(6), " WETH" );

    
    //cooper s - keep this here as an example. Remove when not needed any more
    /*    const trade = new Trade(route, new TokenAmount(weth, '10000000000000000'), TradeType.EXACT_INPUT );

        console.log("Getprice - trade object: ", trade.quoteCurrency );

        const slippageTolerance = new Percent ('50','10000') //50 bips = 0.050 or 5%
        const path = [weth.address, dai.address ];
        const to = '0xfFD5F5B573Ac9f6109C07822C74e0c96CbC81848';
        //const to = '0x4986828740bBDBC7CD6Ab10e0753d123f868dc40';//Mainnet
        const deadline = Math.floor(Date.now()/1000) + 60 * 20;
        const value = ethers.BigNumber.from(trade.inputAmount.raw.toString()).toHexString();
        console.log("trade input: ", value," string");
        //console.log("Minimum expected from trade: ", web3.utils.BN(trade.minimumAmountOut(slippageTolerance).raw).toString() )
        const amountOutMin =  await new ethers.BigNumber.from(trade.minimumAmountOut(slippageTolerance).raw).toString();
    
       console.log("Trade value: ", ethers.utils.formatEther(value)," WEI" );
       console.log("amount out: ", typeof(amountOutMin), " ", ethers.utils.formatUnits(amountOutMin), "DAI" );
*/
       return route.midPrice.toSignificant(6); //ethers.utils.formatUnits(value);

    } catch (e) {
        console.log("Uniswap price failed: ", e.message)// return the amount of WEI to trade
    }

}//end getPrice

module.exports.getPrice = getPrice;

// cooper s - for testing
//getPrice().then ((result) => {
//    console.log("getPrice returns: ", result )
//}