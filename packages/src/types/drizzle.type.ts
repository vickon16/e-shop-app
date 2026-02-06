import {
  usersTable,
  InferSelectModel,
  sellersTable,
  shopsTable,
  productsTable,
  siteConfigTable,
  discountCodesTable,
  imagesTable,
  avatarTable,
} from '../database/index.js';

export type TUserWithPassword = InferSelectModel<typeof usersTable>;
export type TUser = Omit<TUserWithPassword, 'password'>;

export type TSellerWithPassword = InferSelectModel<typeof sellersTable>;
export type TSeller = Omit<TSellerWithPassword, 'password'>;
export type TSellerWithRelations = TSeller & {
  shop: TShop;
};

export type TShop = InferSelectModel<typeof shopsTable> & {
  avatar?: TAvatar | null;
};

export type TProduct = Omit<
  InferSelectModel<typeof productsTable>,
  'createdAt' | 'updatedAt' | 'startingDate' | 'endingDate'
> & {
  createdAt: string;
  updatedAt: string;
  startingDate?: string | null;
  endingDate?: string | null;
};

export type TSiteConfig = InferSelectModel<typeof siteConfigTable>;

export type TDiscountCodes = InferSelectModel<typeof discountCodesTable>;

export type TAvatar = InferSelectModel<typeof avatarTable>;
export type TImages = InferSelectModel<typeof imagesTable>;

export type TProductWithImagesAndShop = TProduct & {
  images: TImages[];
  shop: TShop;
};
