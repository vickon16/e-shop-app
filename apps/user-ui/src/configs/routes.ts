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
  static offer = '/offer';
  static becomeSeller = '/become-seller';
  static inbox = '/inbox';
  static checkout = '/checkout';
}

export type TRoutesKeys = keyof typeof Routes;

export { Routes };
