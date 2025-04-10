const cron = require('node-cron');
const FoodItem = require('./models/food-model');

// Initialize cron tasks
const initCronTasks = () => {
  console.log('Initializing scheduled tasks...');

  // Check for expired food items every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      console.log(`[${now.toISOString()}] Running expired food items check`);
      
      const result = await FoodItem.updateMany(
        { expiresAt: { $lte: now }, status: "available" },
        { $set: { status: "expired", isAvailable: false } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`[CRON] Updated ${result.modifiedCount} expired food items`);
      }
    } catch (error) {
      console.error('[CRON] Error in expired food items check:', error);
    }
  });

  console.log('Scheduled tasks initialized');
};

module.exports = { initCronTasks }; 