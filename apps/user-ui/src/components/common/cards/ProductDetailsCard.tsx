'use client';
import { Routes } from '@/configs/routes';
import type {
  TProductWithImagesAndShop,
  TUser,
} from '@e-shop-app/packages/types';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Ratings } from '../Ratings';
import { LuHeart, LuMapPin } from 'react-icons/lu';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FaCartPlus } from 'react-icons/fa';
import { useAppStore } from '@/store';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { useDeviceInfo } from '@/hooks/use-device-tracking';

type Props = {
  product: TProductWithImagesAndShop;
  currentUser: TUser;
  onClose?: () => void;
};

export const ProductDetailsCard = (props: Props) => {
  const { product, onClose, currentUser } = props;
  const [activeImage, setActiveImage] = useState(0);
  const [isSelectedColor, setIsSelectedColor] = useState<string | null>(
    product?.colors?.[0] || null,
  );
  const [isSelectedSize, setIsSelectedSize] = useState<string | null>(
    product?.sizes?.[0] || null,
  );
  const [quantity, setQuantity] = useState(1);

  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceInfo();

  const store = useAppStore((state) => state);
  const {
    addToCart,
    wishlist,
    cart,
    removeFromCart,
    addToWishList,
    removeFromWishList,
    decreaseQuantity,
    increaseQuantity,
  } = store;

  const isWishListed = wishlist.some((item) => item.id === product.id);
  const isInCart = cart.some((item) => item.id === product.id);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7); // Assuming delivery takes 7 days

  return (
    <div className="w-full grid sm:grid-cols-2 md:grid-cols-3">
      <div className="w-full h-full flex flex-col gap-y-3 p-4">
        <div className="relative size-full">
          <Image
            src={product?.images?.[activeImage]?.fileUrl}
            alt="Product image"
            fill
            className="size-full rounded-lg object-contain"
          />
        </div>

        {/* Thumbnails */}
        {product?.images.length > 0 && (
          <div className="flex gap-2">
            {product?.images?.map((image, index) => (
              <div
                key={image.id}
                className={`relative size-20 border-2 rounded-lg cursor-pointer ${
                  index === activeImage
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
                onClick={() => setActiveImage(index)}
              >
                <Image
                  src={image.fileUrl}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="size-full rounded-lg object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="w-full md:col-span-2 h-full md:pl-8 pt-8 flex flex-col gap-y-3">
        {/* Seller Info */}
        <div className="border-b relative w-full pb-3 border-gray-200 justify-between flex items-start gap-3">
          {/* Shop Logo */}

          {product?.shop?.avatar?.fileUrl && (
            <Image
              src={product.shop?.avatar?.fileUrl}
              alt={product.shop.name}
              width={60}
              height={60}
              className="size-15 rounded-full object-cover"
            />
          )}

          <div className="space-y-1 flex-1">
            <Link
              href={`${Routes.shop}/${product?.shop?.id}`}
              className="text-lg font-medium"
            >
              {product?.shop?.name || 'Unknown Shop'}
            </Link>

            <span className="block">
              <Ratings rating={product?.shop?.ratings || 0} />
            </span>

            {/* Shop location */}
            <p className="text-gray-600 flex items-center gap-2 text-xs">
              <LuMapPin className="size-[16px]" />
              <span className="truncate max-w-[300px]">
                {product?.shop?.address || 'Unknown Location'}
              </span>
            </p>
          </div>

          <Link
            className={buttonVariants({ size: 'sm' })}
            href={`${Routes.inbox}?shopId=${product.shopId}`}
          >
            Chat with Seller
          </Link>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold font-poppins ">
            {product?.title}
          </h3>

          <p className="text-gray-700 text-sm whitespace-pre-wrap w-full">
            {product?.description}
          </p>
          {product?.brand && (
            <p className="">
              <span className="text-muted-foreground text-xs">Brand:</span>{' '}
              {product?.brand}
            </p>
          )}
        </div>

        {/* Color and size selection */}
        <div className="flex flex-col md:flex-row items-start gap-5">
          {product?.colors?.length > 0 && (
            <div>
              <strong>Color:</strong>
              <div className="flex gap-2 mt-1">
                {product?.colors.map((color, index) => {
                  return (
                    <button
                      type="button"
                      key={color}
                      className={cn(
                        `size-8 p-2 rounded-md flex items-center justify-center border-transparent transition cursor-pointer border-2`,
                        {
                          'scale-110 border-gray-400 shadow-md':
                            isSelectedColor === color,
                        },
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setIsSelectedColor(color)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Size selections */}
        <div className="flex flex-col md:flex-row items-start gap-5">
          {product?.sizes?.length > 0 && (
            <div>
              <strong>Sizes:</strong>
              <div className="flex gap-2 mt-1">
                {product?.sizes.map((size, index) => {
                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setIsSelectedSize(size)}
                      className={cn(
                        `px-3 py-1 rounded-lg bg-gray-300 text-foreground flex items-center justify-center transition cursor-pointer border border-gray-600`,
                        {
                          'bg-gray-800 text-white': isSelectedSize === size,
                        },
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 mt-5!">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-semibold text-gray-900">
              ${product?.salePrice}
            </h3>
            {product?.regularPrice && (
              <h3 className="text-lg text-red-600 line-through">
                ${product?.regularPrice}
              </h3>
            )}
          </div>

          <div className="flex justify-center items-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]">
            <button
              className="text-black cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed text-xl"
              onClick={() => decreaseQuantity(product.id)}
              disabled={!isInCart}
            >
              -
            </button>
            <span className="px-4">
              {cart?.find((item) => item.id === product.id)?.quantity ?? 1}
            </span>
            <button
              className="text-black cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed text-xl"
              onClick={() => increaseQuantity(product.id)}
              disabled={!isInCart}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3!">
          <Button
            size="lg"
            variant={isWishListed ? 'outlineDestructive' : 'outline'}
            className="w-fit"
            onClick={() =>
              isWishListed
                ? removeFromWishList({
                    id: product.id,
                    location,
                    deviceInfo,
                    user: currentUser,
                  })
                : addToWishList({
                    product,
                    deviceInfo,
                    location,
                    user: currentUser,
                  })
            }
          >
            <LuHeart className="fill-red-500 stroke-red-500 size-[20px]! text-black" />
            {isWishListed ? 'Remove' : 'Save'}
          </Button>
          <Button
            size="lg"
            variant={isInCart ? 'destructive' : 'primary2Dark'}
            className="w-full"
            onClick={() =>
              isInCart
                ? removeFromCart({
                    id: product.id,
                    location,
                    deviceInfo,
                    user: currentUser,
                  })
                : addToCart({
                    product,
                    deviceInfo,
                    location,
                    user: currentUser,
                  })
            }
          >
            <FaCartPlus />
            {isInCart ? 'Remove from Cart' : 'Add to Cart'}
          </Button>
        </div>

        {/* Out of stock */}
        <div className="mt-5!">
          {product?.stock > 0 ? (
            <span className="text-green-600 font-semibold">
              <span className="text-muted-foreground font-normal">
                In Stock:
              </span>{' '}
              {product?.stock} items available
            </span>
          ) : (
            <span className="text-red-600 font-medium">Out of Stock</span>
          )}
        </div>

        <div className="tet-gray-600 text-sm">
          <span className="text-muted-foreground font-normal">
            Estimated Delivery:
          </span>{' '}
          <strong>{estimatedDelivery.toDateString()}</strong>
        </div>
      </div>
    </div>
  );
};
