class Routes {
  static userAppUrl = process.env.NEXT_PUBLIC_USER_APP_URL;
  static sellerAppUrl = process.env.NEXT_PUBLIC_SELLER_APP_URL;
  static home = '/';
  static authPrefix = '/auth';

  static auth = {
    login: `${this.authPrefix}/login`,
    signup: `${this.authPrefix}/signup`,
    forgotPassword: `${this.authPrefix}/forgot-password`,
  };

  static profile = `/profile`;
  static wishlist = '/wishlist';
  static cart = '/cart';
  static product = '/product';
  static shop = '/shop';
  static offers = '/offers';
  static becomeSeller = '/become-seller';
  static inbox = '/inbox';
}

export type TRoutesKeys = keyof typeof Routes;

export { Routes };
