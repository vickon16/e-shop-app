import { appDb, eq, sellersTable } from '@e-shop-app/packages/database';
import { TSellerWithPassword } from '@e-shop-app/packages/types';

export const getSellerBy = async (
  type: 'email' | 'id',
  value: string,
  withPassword?: boolean,
) => {
  const currentUser = await appDb.query.sellersTable.findFirst({
    where: eq(type === 'email' ? sellersTable.email : sellersTable.id, value),
    columns: withPassword
      ? undefined // select ALL columns
      : {
          password: false, // exclude only password
        },
    with: {
      shop: true,
    },
  });

  return currentUser as TSellerWithPassword | undefined;
};
