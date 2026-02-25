import { appDb, lte, productsTable } from '@e-shop-app/packages/database';
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
