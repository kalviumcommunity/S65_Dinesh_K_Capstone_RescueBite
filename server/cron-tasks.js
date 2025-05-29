const cron = require('node-cron');
const FoodItem = require('./models/food-model');


const initCronTasks = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      const result = await FoodItem.updateMany(
        { expiresAt: { $lte: now }, status: "available" },
        { $set: { status: "expired", isAvailable: false } }
      );
      
      if (result.modifiedCount > 0) {
      }
    } catch (error) {
    }
  });
};

module.exports = { initCronTasks }; 