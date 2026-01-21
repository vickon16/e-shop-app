import { appDb, eq, usersTable } from '@e-shop-app/packages/database';
import { TUserWithPassword } from '@e-shop-app/packages/types';

export const getUserBy = async (
  type: 'email' | 'id',
  value: string,
  withPassword?: boolean,
) => {
  const currentUser = await appDb.query.usersTable.findFirst({
    where: eq(type === 'email' ? usersTable.email : usersTable.id, value),
    columns: withPassword
      ? undefined // select ALL columns
      : {
          password: false, // exclude only password
        },
    with: {
      avatar: true,
    },
  });

  return currentUser as TUserWithPassword | undefined;
};
