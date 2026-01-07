class Routes {
  static appUrl = process.env.NEXT_PUBLIC_APP_URL;
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
  static products = '/products';
  static shops = '/shops';
  static offers = '/offers';
  static becomeSeller = '/become-seller';
}

export type TRoutesKeys = keyof typeof Routes;

export { Routes };
