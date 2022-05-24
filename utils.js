
const ethers = require("ethers");
const { BigNumber, Wallet, Contract, providers, utils } = require( "ethers" );
 
function parseBigNumber(n, d) {
    return utils.formatUnits(BigNumber.from(n.toString()), Number(d || "18"));
}

function parseUnits(n, d) {
    return ethers.utils.parseUnits(n.toString(), Number(d || "18")).toString()
} 

function getAmountIn(reserveIn, reserveOut, amountOut, fee) {
    const numerator = reserveIn.mul(amountOut).mul(10000);
    const denominator = reserveOut.sub(amountOut).mul(fee);
    return numerator.div(denominator).add(1);
}

function getAmountOut(reserveIn, reserveOut, amountIn, fee) {
    const amountInWithFee = amountIn.mul(fee);
    const numerator = amountInWithFee.mul(reserveOut);
    const denominator = reserveIn.mul(10000).add(amountInWithFee);
    return numerator.div(denominator);
}

function encode (s) {
    return encodeURIComponent(s.trimEnd().trimStart());
}

module.exports = {
    parseBigNumber,
    parseUnits, 
    getAmountIn,
    getAmountOut,
    encode
}