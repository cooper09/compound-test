const { ethers, BigNumber } = require('ethers');
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

const { logBalances } = require("./modules/logBalances");

/***********************************************************************************/ 
const start = async (acct) => {    console.log("Borrow some ETH, baby...");

console.log("borrow eth for: ", acct  )

    const networkAddr = await provider.getNetwork();
    console.log("network id: ", networkAddr );

    await logBalances();
    let underlyingAsCollateral = 1;

      // Convert the token amount to a scaled up number, then a string.
  underlyingAsCollateral = underlyingAsCollateral * Math.pow(10, underlyingDecimals);
  underlyingAsCollateral = underlyingAsCollateral.toString();

  console.log(`\nApproving ${assetName} to be transferred from your wallet to the c${assetName} contract...\n`);
  const approve = await underlying.approve(cTokenAddress, underlyingAsCollateral);
  await approve.wait(1);

  console.log(`Supplying ${assetName} to the protocol as collateral (you will get c${assetName} in return)...\n`);
  
  /* cooper s - Not sure why we have to mint a cDai here...??  
  let mint = await cToken.mint(underlyingAsCollateral);
  const mintResult = await mint.wait(1);

  let failure = mintResult.events.find(_ => _.event === 'Failure');
  if (failure) {
    const errorCode = failure.args.error;
    throw new Error(
      `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
      `Code: ${errorCode}\n`
    );
  }
//*/
  await logBalances();

  console.log('\nEntering market (via Comptroller contract) for ETH (as collateral)...');
  let markets = [cTokenAddress]; // This is the cToken contract(s) for your collateral
  let enterMarkets = await comptroller.enterMarkets(markets);
  await enterMarkets.wait(1);

  console.log('Calculating your liquid assets in the protocol...');
  let {1:liquidity} = await comptroller.callStatic.getAccountLiquidity(myWalletAddress);
  liquidity = (+liquidity / 1e18).toString();
  console.log("Liqudity: ", liquidity)

  console.log(`Fetching the protocol's ${assetName} collateral factor...`);
  let {1:collateralFactor} = await comptroller.callStatic.markets(cTokenAddress);
  collateralFactor = (collateralFactor / Math.pow(10, underlyingDecimals)) * 100; // Convert to percent
  console.log(`Collateral factor - I can borrow up ${collateralFactor}%`)

  console.log(`Fetching ${assetName} price from the price feed...`);
  let underlyingPriceInUsd = await priceFeed.callStatic.price(assetName);
  underlyingPriceInUsd = underlyingPriceInUsd / 1e6; // Price feed provides price in USD with 6 decimal places
  console.log("underlying price: ", underlyingPriceInUsd )

  console.log('Fetching borrow rate per block for ETH borrowing...');
  let borrowRate = await cEth.callStatic.borrowRatePerBlock();
  borrowRate = borrowRate / 1e18;
  console.log("borrow rate: ", underlyingPriceInUsd )


  console.log(`\nYou have ${liquidity} of LIQUID assets (worth of USD) pooled in the protocol.`);
  console.log(`You can borrow up to ${collateralFactor}% of your TOTAL assets supplied to the protocol as ETH.`);
  console.log(`1 ${assetName} == ${underlyingPriceInUsd.toFixed(6)} USD`);
  console.log(`You can borrow up to ${liquidity} USD worth of assets from the protocol.`);
  console.log(`NEVER borrow near the maximum amount because your account will be instantly liquidated.`);
  console.log(`\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) ETH per block.\nThis is based on the current borrow rate.`);

  //cooper s - calculate actual amount to borrow: 
  let maxBorrow = liquidity*0.835/2;
  console.log("maxBorrow: ", maxBorrow );

  //const canDo = await cEth.borrow(ethers.utils.parseEther(maxBorrow.toString()));
    //const canDo = BigNumber.from(parseInt(maxBorrow));
  //console.log("can Do: ", ethers.utils.formatUnits(canDo ))

// cooper s - convert the maximum you can can borrow from $ to Eth

 // Let's try to borrow 0.002 ETH (or another amount far below the borrow limit)
  const ethToBorrow = 0.002 //0.01295 //0.03026 //0.002;
  console.log(`\nNow attempting to borrow ${ethToBorrow} ETH...`);
 /* cooper s  - don't want to borrow too much too soon... */
  const borrow = await cEth.borrow(ethers.utils.parseEther(ethToBorrow.toString()));
  const borrowResult = await borrow.wait(1);

  if (isNaN(borrowResult)) {
    console.log(`\nETH borrow successful.\n`);
    //console.log('\n Amt borrowed: ', borrowResult )
  } else {
    throw new Error(
      `See https://compound.finance/docs/ctokens#ctoken-error-codes\n` +
      `Code: ${borrowResult}\n`
    );
  }
    await logBalances();
//*/
    console.log('\nFetching your ETH borrow balance from cETH c ontract...');
    let balance = await cEth.callStatic.borrowBalanceCurrent(myWalletAddress);
    balance = balance / 1e18; // because DAI is a 1e18 scaled token.
    
    //cooper s = hardcode about $100 for now...
    balance = ethToBorrow  //0.003 //0.06052 //0.03026  //0.002
    console.log(`Borrow balance is ${balance} ETH`);
    console.log(`\nThis part is when you do something with those borrowed assets!\n`);
    
    //cooper s - transfer borrowed Eth to acct1
    console.log("amount borrowed: ", balance )
//* cooper s = make sure this transaciton is uncommented when running in producton
    const tx = {
        from: account.address,
        to: acct, 
       // value: ethers.utils.parseUnits('0.002', 'ether'),
       value: ethers.utils.parseUnits(balance.toString(), 'ether'),
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
//
        await logBalances();

// cooper s - start repay here...
/*    console.log(`Now repaying the borrow...`);

    const ethToRepay = ethToBorrow;
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
*/
    process.exit(0);

}//end start

/***********************************************************************************/ 

start(acct1).catch (e => {
    console.log("BorrowEth Error: ", e.message )
});