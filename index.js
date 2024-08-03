
const botToken = '7439110623:AAH6IM56jXIPH7OcNygio-lI6S0G5y3E3Jc';
const express = require('express');
const { Telegraf } = require('telegraf');
const axios = require('axios');
const cron = require('node-cron');
const bot = new Telegraf(botToken);

async function getGroupChatId() {
    try {
        const response = await axios.get(`https://api.telegram.org/bot${botToken}/getUpdates`);
        const updates = response.data.result;

        // Find the latest message in the group
        for (let update of updates) {
            if (update.message && update.message.chat && update.message.chat.type === 'group') {
                const chatId = update.message.chat.id;
                console.log('Group Chat ID:', chatId);
                return chatId;
            }
        }

        console.log('No group messages found. Please send a message in the group.');
    } catch (error) {
        console.error('Error fetching updates:', error);
    }
    return null;
}

// Function to fetch a random Wikipedia article and its summary
async function fetchRandomWikiArticle() {
    try {
        const randomResponse = await axios.get('https://en.wikipedia.org/api/rest_v1/page/random/summary');
        const { title, extract, content_urls } = randomResponse.data;
        return {
            title,
            summary: extract,
            url: content_urls.desktop.page
        };
    } catch (error) {
        console.error('Error fetching Wikipedia article:', error);
        return null;
    }
}

// Function to post the article to the Telegram group
async function postToTelegram() {
    const article = await fetchRandomWikiArticle();
    if (article) {
        const message = `<b>${article.title}</b>\n\n${article.summary}\n\n[Read more](${article.url})`;
        const chatId = await getGroupChatId(); // Wait for the chat ID to be fetched
        if (chatId) {
            bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
        }
    }
}

// postToTelegram()
// Schedule the cron job to run every 2 seconds
cron.schedule('0 9 * * *', () => {
    console.log('Running cron job to post random Wikipedia article');
    postToTelegram();
});

