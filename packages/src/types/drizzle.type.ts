import {
  usersTable,
  InferSelectModel,
  sellersTable,
  shopsTable,
  productsTable,
  siteConfigTable,
  discountCodesTable,
} from '../database/index.js';

export type TUserWithPassword = InferSelectModel<typeof usersTable>;
export type TUser = Omit<TUserWithPassword, 'password'>;

export type TSellerWithPassword = InferSelectModel<typeof sellersTable>;
export type TSeller = Omit<TSellerWithPassword, 'password'>;
export type TSellerWithRelations = TSeller & {
  shop: TShop;
};

export type TShop = InferSelectModel<typeof shopsTable>;

export type TProduct = InferSelectModel<typeof productsTable>;

export type TSiteConfig = InferSelectModel<typeof siteConfigTable>;

export type TDiscountCodes = InferSelectModel<typeof discountCodesTable>;
