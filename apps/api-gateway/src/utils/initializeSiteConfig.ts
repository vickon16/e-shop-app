import { appDb, siteConfigTable } from '@e-shop-app/packages/database';

import { shopCategories } from '@e-shop-app/packages/constants';

export async function initializeSiteConfig() {
  try {
    const existingConfig = await appDb.query.siteConfigTable.findFirst();

    if (!existingConfig) {
      await appDb.insert(siteConfigTable).values({
        categories: shopCategories.map((category) => category.value),
        subCategories: shopCategories.reduce(
          (acc, category) => {
            acc[category.value] = category.subCategories;
            return acc;
          },
          {} as Record<string, string[]>,
        ),
      });
      console.log('Site configuration initialized successfully.');
    } else {
      console.log(
        'Site configuration already exists. Skipping initialization.',
      );
    }
  } catch (error) {
    console.error('Error initializing site configuration:', error);
  }
}
