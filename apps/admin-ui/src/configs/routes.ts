class Routes {
  static userAppUrl = process.env.NEXT_PUBLIC_USER_APP_URL;
  static sellerAppUrl = process.env.NEXT_PUBLIC_SELLER_APP_URL;
  static home = '/';

  static auth = {
    login: this.home,
  };

  static dashboard = {
    base: '/dashboard',
    orders: {
      base: '/dashboard/orders',
      order: (orderId: string) => `/dashboard/orders/${orderId}`,
    },
    payments: '/dashboard/payments',
    products: '/dashboard/products',
    users: '/dashboard/users',
    sellers: '/dashboard/sellers',
    events: '/dashboard/events',
    product: {
      base: (productId: string) => `/dashboard/product/${productId}`,
      edit: (productId: string) => `/dashboard/product/edit/${productId}`,
    },
    userAppProductPage: `${this.userAppUrl}/product`,
    inbox: '/dashboard/inbox',
    settings: '/dashboard/settings',
    notifications: '/dashboard/notifications',
    customization: '/dashboard/customization',
    loggers: '/dashboard/loggers',
    management: '/dashboard/management',
  };

  static profile = `/profile`;
  static wishlist = '/wishlist';
  static cart = '/cart';
  static products = '/products';
  static shops = '/shops';
  static offers = '/offers';
  static becomeSeller = '/become-seller';
  static logout = '/logout';

  static sellerSuccessLink = `${this.sellerAppUrl}/seller/success`;
}

export type TRoutesKeys = keyof typeof Routes;

export { Routes };
