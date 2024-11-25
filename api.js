const { Alchemy, Network } = require("alchemy-sdk");

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
    });

    // Periodically fetch transaction receipts for the latest block
    setInterval(async () => {
        if (block !== null) {
            const hexBlock = block.toString(16);
            console.log("Latest block accessed outside in hex:", hexBlock);

            try {
                // Fetch transaction receipts for the current block
                const params = { blockNumber: `0x${hexBlock}` };
                const response = await alchemy.core.getTransactionReceipts(params);
                console.log("Transaction Receipts:", response);
            } catch (error) {
                console.error("Error fetching transaction receipts:", error.message);
            }
        } else {
            console.log("Waiting for the first block to arrive...");
        }
    }, 5000);
    const usdcContract = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
    var tokenmetadata = alchemy.core.getTokenMetadata(usdcContract)
    console.log(tokenmetadata)

};

main();