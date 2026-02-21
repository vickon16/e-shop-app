import { Routes } from '@/configs/routes';
import { TProductWithImagesAndShop, TUser } from '@e-shop-app/packages/types';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Ratings } from '../Ratings';
import { LuEye, LuHeart, LuShoppingBag } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import CustomModal from '../CustomModal';
import { ProductDetailsCard } from './ProductDetailsCard';
import { useAppStore } from '@/store';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { useDeviceInfo } from '@/hooks/use-device-tracking';
import { useSendKafkaEvent } from '@/actions/mutations/base.mutation';

const iconWrapperClass =
  'bg-white rounded-full p-[6px] shadow-md flex items-center justify-center';

type Props = {
  currentUser?: TUser;
  product: TProductWithImagesAndShop;
};

export const ProductCard = (props: Props) => {
  const { product, currentUser } = props;
  const [timeLeft, setTimeLeft] = useState('');
  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceInfo();

  const kafkaEventSender = useSendKafkaEvent();

  const store = useAppStore((state) => state);
  const {
    addToCart,
    wishlist,
    cart,
    removeFromCart,
    addToWishList,
    removeFromWishList,
  } = store;

  const isWishListed = wishlist.some((item) => item.id === product.id);
  const isInCart = cart.some((item) => item.id === product.id);

  const isEvent = !!product.startingDate;

  useEffect(() => {
    const endingDate = product?.endingDate;

    if (isEvent && !!endingDate) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const endDate = new Date(endingDate).getTime();
        const diff = endDate - now;

        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft('Expired');
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff % (1000 * 60)) % 60);

        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`);
      }, 60000);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [isEvent, product?.endingDate]);

  return (
    <>
      <section className="w-full min-h-[350px] h-max bg-white rounded-xl overflow-hidden relative">
        {isEvent && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
            OFFER
          </div>
        )}

        {product?.stock <= 5 && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
            Limited Stock
          </div>
        )}

        <Link href={`${Routes.product}/${product.id}`}>
          <Image
            src={product.images[0]?.fileUrl}
            alt={product.title}
            width={300}
            height={300}
            className="w-full h-[200px] mx-auto rounded-t-md object-cover"
          />
        </Link>

        <div className="p-3 space-y-2">
          <Link
            href={`${Routes.shop}/${product.shop.id}`}
            className="block text-blue-500 text-sm font-medium"
          >
            {product.shop.name}
          </Link>

          <Link href={`${Routes.product}/${product.slug}`}>
            <h3 className="text-base font-semibold text-gray-800 line-clamp-1">
              {product.title}
            </h3>
          </Link>

          <Ratings rating={parseFloat(product.ratings)} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ${product?.salePrice}
              </span>
              <span className="text-sm line-through text-gray-900">
                ${product?.regularPrice}
              </span>
            </div>

            <span className="text-green-500 text-sm font-medium">
              {product.totalSales} {product.totalSales > 1 ? 'sold' : 'sale'}
            </span>
          </div>

          {isEvent && timeLeft && (
            <span className="inline-block text-xs bg-orange-100 text-orange-700">
              {timeLeft}
            </span>
          )}

          <div className="absolute z-10 flex flex-col gap-3 right-3 top-5">
            <button
              className={iconWrapperClass}
              onClick={() =>
                isWishListed
                  ? removeFromWishList({
                      id: product.id,
                      location,
                      deviceInfo,
                      user: currentUser,
                      sendEvent: kafkaEventSender.mutate,
                    })
                  : addToWishList({
                      product,
                      deviceInfo,
                      location,
                      user: currentUser,
                      sendEvent: kafkaEventSender.mutate,
                    })
              }
            >
              <LuHeart
                className={cn(
                  'cursor-pointer hover:scale-110 transition size-[22px] ',
                  isWishListed
                    ? 'fill-red-500 stroke-red-500'
                    : 'fill-gray-500 stroke-gray-500',
                )}
              />
            </button>
            <button
              onClick={() => setOpenPreview(true)}
              className={iconWrapperClass}
            >
              <LuEye
                className={cn(
                  'cursor-pointer hover:scale-110 transition size-[22px] text-[#4b5563]',
                )}
              />
            </button>
            <button
              className={iconWrapperClass}
              onClick={() =>
                isInCart
                  ? removeFromCart({
                      id: product.id,
                      location,
                      deviceInfo,
                      user: currentUser,
                      sendEvent: kafkaEventSender.mutate,
                    })
                  : addToCart({
                      product,
                      deviceInfo,
                      location,
                      user: currentUser,
                      sendEvent: kafkaEventSender.mutate,
                    })
              }
            >
              <LuShoppingBag
                className={cn(
                  'cursor-pointer hover:scale-110 transition size-[18px] ',
                  isInCart ? ' text-green-500' : 'text-[#4b5563]',
                )}
              />
            </button>
          </div>
        </div>
      </section>

      {openPreview && (
        <CustomModal
          open={!!openPreview}
          onOpenChange={() => setOpenPreview(false)}
          classNames={{
            content: 'md:max-w-[1000px] min-h-[700px]',
          }}
        >
          <ProductDetailsCard
            product={product}
            onClose={() => setOpenPreview(false)}
            currentUser={currentUser}
          />
        </CustomModal>
      )}
    </>
  );
};
