export type NavItemTypes = {
  title: string;
  href: string;
};

export type TUserTableMeta = {
  page: number;
  limit: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type TBaseServerResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  meta?: TUserTableMeta;
};
