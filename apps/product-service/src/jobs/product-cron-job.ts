import {
  appDb,
  lte,
  productsTable,
  shopsTable,
} from '@e-shop-app/packages/database';
import cron from 'node-cron';

// Schedule the cron job to run every one hour
cron.schedule('0 * * * *', async () => {
  console.log('Running product cleanup cron job...');

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const deletedProducts = await appDb
      .delete(productsTable)
      .where(lte(productsTable.deletedAt, oneDayAgo))
      .returning();

    if (deletedProducts.length > 0) {
      console.log(
        `Product cleanup cron job completed. Deleted ${deletedProducts.length} products.`,
      );
    }
  } catch (error) {
    console.error('Error during product cleanup cron job:', error);
  }
});

// Schedule the cron job to run every day for shops
cron.schedule('0 0 * * *', async () => {
  console.log('Running shop cleanup cron job...');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 1000 * 60 * 24);

  try {
    const deletedShops = await appDb
      .delete(shopsTable)
      .where(lte(shopsTable.deletedAt, thirtyDaysAgo))
      .returning();

    if (deletedShops.length > 0) {
      console.log(
        `Shop cleanup cron job completed. Deleted ${deletedShops.length} shops.`,
      );
    }
  } catch (error) {
    console.error('Error during shop cleanup cron job:', error);
  }
});
