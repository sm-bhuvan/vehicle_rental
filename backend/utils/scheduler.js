// utils/scheduler.js
const cron = require('node-cron');
const Quote = require('../models/Quote');

const checkExpiredQuotes = async () => {
    console.log('Running scheduled task: Checking for expired quotes...');
    const now = new Date();
    try {
        const result = await Quote.updateMany(
            { status: 'sent', validUntil: { $lt: now } },
            { $set: { status: 'expired' } }
        );
        console.log(`Updated ${result.modifiedCount} quotes to 'expired'.`);
    } catch (error) {
        console.error('Error in scheduled task:', error);
    }
};

const startSchedulers = () => {
    // Schedule the task to run once every hour
    cron.schedule('0 * * * *', checkExpiredQuotes);
    console.log('Scheduled tasks started.');
};

module.exports = { startSchedulers };