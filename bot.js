const TelegramBot = require('node-telegram-bot-api');
const token = '7705389220:AAGv3AwcUtqrBPcDEKKRsmwLgg410W6L3iw'; // Replace with your actual bot token
const bot = new TelegramBot(token, { polling: true });

// Store user-specific guesses (as arrays)
const userGuesses = {};

// Start a single interval to generate random numbers every 10 seconds
setInterval(() => {
    const randomNumber = (Math.floor(Math.random() * 5) + 1).toString();
    console.log(`Generated number: ${randomNumber}`);

    // Notify all users whose guesses contain the generated number
    Object.keys(userGuesses).forEach((chatId) => {
        if (userGuesses[chatId].includes(randomNumber)) {
            bot.sendMessage(chatId, `The number ${randomNumber} is generated!`);
        }
    });
}, 10000); // Generate a number every 10 seconds

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
    } else if (!isNaN(messageText) && messageText >= 1 && messageText <= 5) {
        // Add the number to the user's list of guesses
        if (!userGuesses[chatId]) {
            userGuesses[chatId] = [];
        }

        if (!userGuesses[chatId].includes(messageText)) {
            userGuesses[chatId].push(messageText); // Add the guess if it's not already present
            bot.sendMessage(chatId, `Your guess of ${messageText} has been recorded!`);
        } else {
            bot.sendMessage(chatId, `You are already tracking the number ${messageText}.`);
        }
    } else {
        bot.sendMessage(chatId, 'Please send a number between 1 and 5, or type "stop" to stop receiving messages.');
    }
});
