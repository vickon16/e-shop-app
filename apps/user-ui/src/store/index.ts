import { useSendKafkaEvent } from '@/actions/mutations/base.mutation';
import { TDeviceInfo } from '@/hooks/use-device-tracking';
import { TLocationStoredData } from '@/hooks/use-location-tracking';
import { TKafkaProductEventSchemaType } from '@e-shop-app/packages/libs/kafka';
import {
  TBaseServerResponse,
  TImages,
  TProduct,
  TUser,
} from '@e-shop-app/packages/types';
import { UseMutateFunction } from '@tanstack/react-query';
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
  user?: TUser;
  location?: TLocationStoredData | null;
  deviceInfo?: TDeviceInfo | null;
  sendEvent: UseMutateFunction<
    TBaseServerResponse<null>,
    Error,
    TKafkaProductEventSchemaType
  >;
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
        const { product, user, location, deviceInfo } = props;

        set((state) => {
          const existing = state?.cart?.find((item) => item.id === product.id);
          if (existing) {
            return {
              ...state,
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? {
                      ...product,
                      quantity: (product.quantity ?? item.quantity ?? 1) + 1,
                    }
                  : item,
              ),
            };
          }

          return {
            ...state,
            cart: [
              ...state.cart,
              { ...product, quantity: product.quantity ?? 1 },
            ],
          };
        });

        // Send kafka event
        if (user?.id && location && deviceInfo) {
          props?.sendEvent?.({
            action: 'add-to-cart',
            userId: user.id,
            productId: product.id,
            shopId: product.shopId,
            country: location?.country,
            city: location?.city,
            device: deviceInfo?.deviceString,
          });
        }
      },

      removeFromCart: (props) => {
        const { id, user, location, deviceInfo } = props;

        const foundProduct = get().cart.find((item) => item.id === id);

        set((state) => ({
          ...state,
          cart: state.cart.filter((item) => item.id !== id),
        }));

        if (user?.id && location && deviceInfo && foundProduct) {
          props?.sendEvent?.({
            action: 'remove-from-cart',
            userId: user.id,
            productId: foundProduct.id,
            shopId: foundProduct.shopId,
            country: location?.country,
            city: location?.city,
            device: deviceInfo?.deviceString,
          });
        }
      },

      addToWishList: (props) => {
        const { product, user, location, deviceInfo } = props;

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

        if (user?.id && location && deviceInfo) {
          props?.sendEvent?.({
            action: 'add-to-wishlist',
            userId: user.id,
            productId: product.id,
            shopId: product.shopId,
            country: location?.country,
            city: location?.city,
            device: deviceInfo?.deviceString,
          });
        }
      },

      removeFromWishList: (props) => {
        const { id, user, location, deviceInfo } = props;

        const foundProduct = get().wishlist.find((item) => item.id === id);

        set((state) => ({
          ...state,
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));

        if (user?.id && location && deviceInfo && foundProduct) {
          props?.sendEvent?.({
            action: 'remove-from-wishlist',
            userId: user.id,
            productId: foundProduct.id,
            shopId: foundProduct.shopId,
            country: location?.country,
            city: location?.city,
            device: deviceInfo?.deviceString,
          });
        }
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
