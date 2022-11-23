const { ethers } = require('hardhat');
const { account } = require("./accts");

const wethArtifact = require('../artifacts/contracts/Weth.sol/Weth.json');
const daiArtifact = require('../artifacts/contracts/Dai.sol/Dai.json');

const UniswapABI = require("../abis/UniswapRouter.json")

const wethAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //Mainnet
const daiAddr = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; //Mainnet

const daiContract = new ethers.Contract( 
    daiAddr, 
    daiArtifact.abi, 
    account );

//Create UniswapV2 Router contract
    const router = new ethers.Contract( 
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        UniswapABI,
        account
    );

    module.exports.wethArtifact = wethArtifact;
    module.exports.daiArtifact = daiArtifact;
    module.exports.wethAddr = wethAddr;
    module.exports.daiArtifact = daiAddr;
    module.exports.daiContract = daiContract;
    module.exports.daiAddr = daiAddr;
    module.exports.wethAddr = wethAddr;
    module.exports.router = router;