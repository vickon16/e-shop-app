import { appDb, eq, sellersTable } from '@e-shop-app/packages/database';
import { TUser } from '@e-shop-app/packages/types';

export const getSellerBy = async (
  type: 'email' | 'id',
  value: string,
  withPassword?: boolean,
) => {
  const currentUser = await appDb.query.sellersTable.findFirst({
    where: eq(type === 'email' ? sellersTable.email : sellersTable.id, value),
    columns: {
      password: Boolean(withPassword),
    },
  });

  return currentUser as TUser | undefined;
};
