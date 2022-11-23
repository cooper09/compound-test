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

const approve = async (daiContract, account, value ) => {
    console.log("Sellswap - Approve: ", value );

    let count = await provider.getTransactionCount(account.address, 'latest')

    const routerWithWallet = router.connect(provider); 
    const decimals = 18;
                    
    const approveTx = await daiContract.populateTransaction.approve(router.address, value )

    let sendTxn = (await account).sendTransaction(approveTx);
    let receipt = (await sendTxn).wait();

    if (receipt) {
        console.log(" -Approval Transaction is mined - " + '\n' 
        + "Transaction Hash:", (await sendTxn).hash
        + '\n' + "Block Number: " 
        + (await receipt).blockNumber + '\n' 
        + "Navigate to whereever" 
        + (await sendTxn).hash, "to see your transaction")

        return true;
        
    } else {
        console.log("Error submitting approval transaction")
    }//end try/catch

}//end approve

module.exports = {approve}

//approve(daiContract, account, toWei("0.1")) 