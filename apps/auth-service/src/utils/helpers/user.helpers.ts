import { appDb, eq, usersTable } from '@e-shop-app/packages/database';
import { TUserWithPassword } from '@e-shop-app/packages/types';

export const getUserBy = async (
  type: 'email' | 'id',
  value: string,
  withPassword?: boolean,
) => {
  const currentUser = await appDb.query.usersTable.findFirst({
    where: eq(type === 'email' ? usersTable.email : usersTable.id, value),
    columns: {
      password: Boolean(withPassword),
    },
  });

  return currentUser as TUserWithPassword | undefined;
};
