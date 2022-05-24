
require('dotenv').config()
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
const logger = require("./logger");
const ethers = require("ethers");
const { parseBigNumber, parseUnits } = require('./utils');
const { BigNumber, Wallet, Contract, providers, utils } = require( "ethers" );
const constants = require("./constants");
 
const amountIn = BigNumber.from("100000000000000000"); // tradable amount.
//const gasLimit = BigNumber.from("445856"); // depends on tx data. 418716, 405747, 445853
  
const init = async () => {
    
    const provider = new ethers.providers.WebSocketProvider(process.env.WSS_URL);
    const wallet = new ethers.Wallet(process.env.EXECUTOR_KEY, provider);
    const signer = wallet.connect(provider);
    const swapContract = new Contract(constants.FLASHSWAP_CONTRACT_ADDRESS, constants.FLASHSWAP_CONTRACT_ABI, signer);
    
    provider.on("block", async (blockNumber) => {
        const maxBlockNumber = parseInt(blockNumber) + parseInt(process.env.MAX_BLOCK_NUMBER);
        console.debug("Tradable Amount: "+ amountIn.toString());

        try {
              
            const response = await swapContract.functions.searcher1(amountIn.toString(), constants.PANCAKE_ROUTER_ADDRESS, datas);
            const results = response[0]//.filter(t=> t.amountOut > 0).filter(t=> t.amountOut.gt(amountIn));
            const filtered = results
                            .map((v, i) => {  return { amountOut: v.amountOut, index: i }  } )
                            .sort((a, b) => a.amountOut.lt(b.amountOut) ? 1 : a.amountOut.gt(b.amountOut) ? -1 : 0)
                            .map(t=> { return { amountOut: parseBigNumber(t.amountOut), index: t.index } })
            console.log( filtered  )
          
            
        } catch(e) {
            console.log(e);
        }
        
    });

    provider._websocket.on("error", async () => {
        logger.error(`Unable to connect to ${provider.subdomain} retrying in 3s...`);
        provider._websocket.terminate();
        clearInterval(checkInterval);
        clearInterval(gasInterval);
        clearInterval(nonceInterval);
        setTimeout(init, 3000);
    });

    provider._websocket.on("close", async (code) => {
        logger.error(`Connection lost with code ${code}! Attempting reconnect in 3s...` );
        provider._websocket.terminate();
        clearInterval(checkInterval);
        clearInterval(gasInterval);
        clearInterval(nonceInterval);
        setTimeout(init, 1000);
    }); 
} 
 

(async () => { 
    init();
})();

const datas = [
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],

    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],

    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],

    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],

    [[constants.WBNB_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],

    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],

    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],

    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],

    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],

    [[constants.WBNB_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.USDC_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.USDT_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    [[constants.WBNB_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.BUSD_CONTRACT_ADDRESS, constants.DAI_CONTRACT_ADDRESS, constants.WBNB_CONTRACT_ADDRESS], 0],
    
]