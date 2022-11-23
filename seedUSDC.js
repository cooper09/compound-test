const { ethers } = require('ethers');
//const { ethers } = require('hardhat');
const dotenv = require('dotenv').config();

const Compound = require('@compound-finance/compound-js');
/***********************************************************************************/ 

// set up prvider, primary and secondary addresses
const {toBytes32, toString, toWei, toEther, toRound } = require('./modules/utils');
const {provider, acct1, acct2, privateKey, signer, account } = require("./modules/accts");

const { logBalances } = require("./modules/logBalances");

/***********************************************************************************/ 
// Mainnet Contract for cDAI (https://compound.finance/docs#networks)

const amounts = {
    'usdc': 100,
  };

/***********************************************************************************/ 

const seed = async (asset, amount) => {
    console.log("seed me, baby: ", asset )
    const cTokenAddress = Compound.util.getAddress('c' + asset);
    //provider = new Compound._ethers.providers.JsonRpcProvider(jsonRpcUrl);
    //const accounts = await provider.listAccounts();

    // Number of underlying tokens to mint, scaled up so it is an integer
    const numbTokensToSeed = (amount * Math.pow(10, Compound.decimals[asset])).toString();

    console.log("Number of tokens: ", numbTokensToSeed / 1e6 );

    const gasPrice = '0';
    //const gasPrice = await provider.getGasPrice();
    
    try {
        const transferTrx = await Compound.eth.trx(
            Compound.util.getAddress(asset),
            'function transfer(address, uint256) public returns (bool)',
            [ account.address, numbTokensToSeed ],
            { provider: account, gasPrice }
        );
        await transferTrx.wait(1);
      console.log('Local test account successfully seeded with ' + asset);
    } catch(e) {
        console.log("Seed transaction failed: ", e )
    }


const balanceOf = await Compound.eth.read(
    Compound.util.getAddress(asset),
    'function balanceOf(address) public returns (uint256)',
    [ account.address ],
    { provider }
  );
 
  console.log("current balance: ", balanceOf );
  const tokens = +balanceOf / Math.pow(10, Compound.decimals[asset]);
  console.log(asset + ' amount in first localhost account wallet:', tokens);

}//end seed

const testSeed = async(asset, amount )=> {
    console.log(" test seed: ", asset )

    const cUSDCAddress = Compound.util.getAddress(Compound.cUSDC);
    console.log("Token Address: ", cUSDCAddress )

    let supplyRatePerBlock = await Compound.eth.read(
        cUSDCAddress,
        'function supplyRatePerBlock() returns (uint)',
        [], // [optional] parameters
        {}  // [optional] call options, provider, network, ethers.js "overrides"
      );
    
      console.log('USDC supplyRatePerBlock:', supplyRatePerBlock.toString());
      //*/

      try {
      const transferTrx = await Compound.eth.trx(
        Compound.util.getAddress(asset),
        'function transfer(address, uint256) public returns (bool)',
        [ acct2, 1 ],
        { provider: account }
    );
      } catch (e) {
        console.log("transfer failed: ", e.message )
      }
    /*
      const trx = await Compound.eth.trx(
        cUSDCAddress,
        acct2,
        //'function send() external payable',
        'function transfer(address, uint256) public returns (bool)',
        [],
        {
          value: Compound._ethers.utils.parseEther('1.0'), // 1 ETH
          provider: provider // in a web browser
        }
      );
    */
      const toAddressEthBalance = await Compound.eth.getBalance(acct2);
      console.log("final balance: ", toAddressEthBalance/ 1e18)


}//end testSeed

const start = async () => {
    console.log("Seed me some USDC, baby...");

    const networkAddr = await provider.getNetwork();
    console.log("network id: ", networkAddr )

    const assetsToSeed = Object.keys(amounts);
    const seedRequests = [];
    assetsToSeed.forEach((asset) => { seedRequests.push(testSeed(asset.toUpperCase(), amounts[asset])) });

        await Promise.all(seedRequests);

        console.log('\nReady to test locally! To exit, hold Ctrl+C.\n');
        console.log("assets to seed: ", assetsToSeed );
    //})().catch(console.error)


   // await logBalances();
    
    process.exit(0);
}

/***********************************************************************************/ 

start().catch (e => {
    console.log("Seeding USDC Error: ", e.message )
});