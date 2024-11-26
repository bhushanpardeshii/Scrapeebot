const { Alchemy, Network, Utils } = require("alchemy-sdk");

const settings = {
    apiKey: "q_pyhzHmpZkFEWipu_M4t4Ea5z-DVXAg",
    network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);


const main = async () => {
    let block = null;

    // Listen for new blocks
    alchemy.ws.on("block", (blockNumber) => {
        block = blockNumber;
        console.log("Latest block:", blockNumber);
        runmain(blockNumber - 1)
    });

    // Periodically fetch transaction receipts for the latest block
    const runmain = async (block) => {
        console.log('block number in', block)
        if (block !== null) {
            const hexBlock = block.toString(16);
            console.log("Latest block accessed outside in hex:", hexBlock);

            try {
                // Fetch transaction receipts for the current block
                const params = { blockNumber: `0x${hexBlock}` };
                // fetch contract address 
                const response = await alchemy.core.getTransactionReceipts(params);
                response.receipts.forEach(receipt => {
                    if (receipt.contractAddress) {
                        console.log('contract address', receipt.contractAddress)
                    }
                })
                // console.log("Transaction Receipts:", response);
            } catch (error) {
                console.error("Error fetching transaction receipts:", error.message);
            }
            // check if its erc20 token by checking decimals
            //0x704387ead0c9e4a8c8fd70472d6cbae6fa23eb4f
            const usdcContract = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
            var tokenmetadata = await alchemy.core.getTokenMetadata(usdcContract)
            console.log(tokenmetadata.decimals)
        } else {
            console.log("Waiting for the first block to arrive...");
        }
        if (tokenmetadata.decimals == null || 0) {
            return
        } else {

            //to get the eth in the contract        
            const address = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52";
            let balance = await alchemy.core.getBalance(address);
            balance = Utils.formatEther(balance);
            console.log(`Balance of ${address}: ${balance} ETH`);
        }

    }
};

main();