import cron from 'node-cron';
import * as notificationService from '../modules/notifications/notification.service.js';

// Check for expiring subscriptions every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily subscription expiration check...');
  try {
    const notifications = await notificationService.checkExpiringSubscriptions();
    console.log(`Created ${notifications.length} expiring subscription notifications`);
  } catch (error) {
    console.error('Error checking expiring subscriptions:', error);
  }
});

// Check for expiring subscriptions every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly subscription expiration check...');
  try {
    const notifications = await notificationService.checkExpiringSubscriptions();
    if (notifications.length > 0) {
      console.log(`Created ${notifications.length} expiring subscription notifications`);
    }
  } catch (error) {
    console.error('Error checking expiring subscriptions:', error);
  }
});

console.log('Cron jobs scheduled for subscription expiration checks');
