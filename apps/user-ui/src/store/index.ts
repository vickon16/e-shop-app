import { TDeviceInfo } from '@/hooks/use-device-tracking';
import { TLocationStoredData } from '@/hooks/use-location-tracking';
import { TImages, TProduct, TUser } from '@e-shop-app/packages/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type TCustomProduct = Pick<
  TProduct,
  'id' | 'title' | 'shopId' | 'salePrice'
> & {
  images: TImages[];
  quantity?: number;
  selectedOptions?: {
    color?: string;
    size?: string;
  };
};

type TBaseAddTo = {
  user: TUser;
  location: TLocationStoredData | null;
  deviceInfo: TDeviceInfo | null;
};

type TAppStore = {
  cart: TCustomProduct[];
  wishlist: TCustomProduct[];
  addToCart: (props: TBaseAddTo & { product: TCustomProduct }) => void;
  removeFromCart: (props: TBaseAddTo & { id: string }) => void;
  addToWishList: (props: TBaseAddTo & { product: TCustomProduct }) => void;
  removeFromWishList: (props: TBaseAddTo & { id: string }) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
};

export const useAppStore = create(
  persist<TAppStore>(
    (set, get) => ({
      cart: [],
      wishlist: [],

      // add to cart
      addToCart: (props) => {
        const { product } = props;

        set((state) => {
          const existing = state?.cart?.find((item) => item.id === product.id);
          if (existing) {
            return {
              ...state,
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...product, quantity: (item.quantity ?? 1) + 1 }
                  : item,
              ),
            };
          }

          return {
            ...state,
            cart: [...state.cart, { ...product, quantity: 1 }],
          };
        });
      },

      removeFromCart: (props) => {
        const { id } = props;

        // const findProduct = get().cart.find((item) => item.id === id);

        set((state) => ({
          ...state,
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },

      addToWishList: (props) => {
        const { product } = props;

        set((state) => {
          const existing = state?.wishlist?.find(
            (item) => item.id === product.id,
          );

          if (existing) return state;

          return {
            ...state,
            wishlist: [...state.wishlist, product],
          };
        });
      },

      removeFromWishList: (props) => {
        const { id } = props;

        const findProduct = get().wishlist.find((item) => item.id === id);

        set((state) => ({
          ...state,
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));
      },

      increaseQuantity: (productId) => {
        set((state) => ({
          ...state,
          cart: state.cart.map((item) =>
            item.id === productId
              ? { ...item, quantity: (item.quantity ?? 1) + 1 }
              : item,
          ),
        }));
      },

      decreaseQuantity: (productId) => {
        set((state) => ({
          ...state,
          cart: state.cart.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  quantity: Math.max((item.quantity ?? 1) - 1, 1),
                }
              : item,
          ),
        }));
      },
    }),
    {
      name: 'user-ui-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
