const { ethers } = require('hardhat');
// utils
const toBytes32 = text => ( ethers.utils.formatBytes32String(text));
const toString = byte32 => ( ethers.utils.formatBytes32String(byte32));
const toWei = ether => ( ethers.utils.parseEther(ether));
const toEther = wei => ( ethers.utils.formatEther(wei).toString());
const toRound = num => ( ethers.utils.toFixed(2));

const getTimestamp = () => {
    console.log("getTimeStamp...");
    return new Date();
}

module.exports.toBytes32 = toBytes32;
module.exports.toString = toString;
module.exports.toWei = toWei;
module.exports.toEther = toEther;
module.exports.toRound = toRound;
module.exports.getTimestamp = getTimestamp;