const { Alchemy, Network, Utils } = require("alchemy-sdk");
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
// Alchemy configuration
const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(settings);

// Telegram bot configuration
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });

// Store user-specific guesses (as arrays)
const userGuesses = {};

// Function to handle each block
const handleBlock = async (blockNumber) => {

    console.log("New block detected:", blockNumber);

    const hexBlock = blockNumber.toString(16);

    try {
        // Fetch transaction receipts for the block
        const params = { blockNumber: `0x${hexBlock}` };
        const response = await alchemy.core.getTransactionReceipts(params);

        response.receipts.forEach(async (receipt) => {
            if (receipt.contractAddress) {
                const contractAddress = receipt.contractAddress;
                console.log("Contract address found:", contractAddress);

                try {
                    // Get token metadata to check if it's ERC20/ERC721
                    const tokenMetadata = await alchemy.core.getTokenMetadata(contractAddress);
                    if (tokenMetadata.decimals !== null && tokenMetadata.decimals > 0) {
                        // Fetch the ETH balance of the contract
                        let balance = await alchemy.core.getBalance(contractAddress);
                        balance = parseFloat(Utils.formatEther(balance));
                        console.log(`Balance of ${contractAddress}: ${balance} ETH`);

                        // Notify users whose guesses are less than or equal to the balance
                        Object.keys(userGuesses).forEach((chatId) => {
                            userGuesses[chatId].forEach((guess) => {
                                if (balance >= parseFloat(guess)) {
                                    bot.sendMessage(
                                        chatId,
                                        `The balance of ${contractAddress} is ${balance} ETH, which is greater than or equal to your guess of ${guess} ETH!`
                                    );
                                }
                            });
                        });
                    }
                } catch (error) {
                    console.log("Not an ERC20/ERC721 contract or error fetching token metadata:", error.message);
                }
            }
        });
    } catch (error) {
        console.error("Error fetching transaction receipts:", error.message);
    }
};

// Listen for new blocks
alchemy.ws.on("block", (blockNumber) => {
    handleBlock(blockNumber - 1);
});

// Handle user messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text.trim().toLowerCase();

    if (messageText === 'stop') {
        // Remove the user from tracking
        if (userGuesses[chatId]) {
            delete userGuesses[chatId];
            bot.sendMessage(chatId, 'You will no longer receive notifications.');
        } else {
            bot.sendMessage(chatId, 'You are not currently tracking any numbers.');
        }
    } else if (!isNaN(messageText)) {
        // Add the number to the user's list of guesses
        if (!userGuesses[chatId]) {
            userGuesses[chatId] = [];
        }

        if (!userGuesses[chatId].includes(messageText)) {
            userGuesses[chatId].push(messageText); // Add the guess if it's not already present
            bot.sendMessage(chatId, `Your amount of ${messageText} ETH has been recorded!`);
        } else {
            bot.sendMessage(chatId, `You are already tracking the balance ${messageText} ETH.`);
        }
    } else {
        bot.sendMessage(chatId, 'Please send an ETH balance to track, or type "stop" to stop receiving messages.');
    }
});
