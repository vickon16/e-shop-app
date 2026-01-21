class Routes {
  static appUrl = process.env.NEXT_PUBLIC_APP_URL;
  static home = '/';
  static authPrefix = '/auth';

  static auth = {
    login: `${this.authPrefix}/login`,
    signup: `${this.authPrefix}/signup`,
    forgotPassword: `${this.authPrefix}/forgot-password`,
  };

  static dashboard = {
    base: '/dashboard',
    orders: '/dashboard/orders',
    payments: '/dashboard/payments',
    createProduct: '/dashboard/create-product',
    allProducts: '/dashboard/all-products',
    createEvent: '/dashboard/create-event',
    allEvents: '/dashboard/all-events',
    inbox: '/dashboard/inbox',
    settings: '/dashboard/settings',
    notifications: '/dashboard/notifications',
    discountCodes: '/dashboard/discount-codes',
  };

  static profile = `/profile`;
  static wishlist = '/wishlist';
  static cart = '/cart';
  static products = '/products';
  static shops = '/shops';
  static offers = '/offers';
  static becomeSeller = '/become-seller';
  static logout = '/logout';

  static sellerSuccessLink = `${this.appUrl}/seller/success`;
}

export type TRoutesKeys = keyof typeof Routes;

export { Routes };
