import { usersTable, InferSelectModel } from '../database/index.js';

export type TUser = InferSelectModel<typeof usersTable>;
