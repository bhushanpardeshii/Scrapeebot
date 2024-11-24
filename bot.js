const TelegramBot = require('node-telegram-bot-api');
const token = '7705389220:AAGv3AwcUtqrBPcDEKKRsmwLgg410W6L3iw'; // Replace with your actual bot token
const bot = new TelegramBot(token, { polling: true });

let intervalId = null; // To store the interval ID
let lastUserGuess = ''; // To store the user's last guess

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text.trim();

    // Check if the message is a number between 1 and 5
    if (!isNaN(messageText) && messageText >= 1 && messageText <= 5) {
        lastUserGuess = messageText; // Store the user's guess

        // If an interval already exists, clear it to restart the 10-second cycle
        if (intervalId) {
            clearInterval(intervalId);
        }

        // Start a new interval to generate a random number every 10 seconds
        intervalId = setInterval(() => {
            const randomNumber = (Math.floor(Math.random() * 5) + 1).toString();
            console.log(`User guessed: ${lastUserGuess}, Generated number: ${randomNumber}`);

            // Check if the generated number matches the user's guess
            if (lastUserGuess === randomNumber) {
                bot.sendMessage(chatId, 'The number is generated!');
                clearInterval(intervalId); // Stop generating numbers after a match
                intervalId = null; // Reset intervalId
            }
        }, 10000);

        bot.sendMessage(chatId, 'Number received! I’ll check every 10 seconds.');
    } else {
        bot.sendMessage(chatId, 'Please send a number between 1 and 5.');
    }
});
