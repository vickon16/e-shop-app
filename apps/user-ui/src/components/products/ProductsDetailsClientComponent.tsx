'use client';

import { useSendKafkaEvent } from '@/actions/mutations/base.mutation';
import { getUserOptions } from '@/actions/queries/base-queries';
import { Routes } from '@/configs/routes';
import { useDeviceInfo } from '@/hooks/use-device-tracking';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { axiosInstance } from '@/lib/axios';
import { useAppStore } from '@/store';
import {
  TBaseServerResponseWithPagination,
  TProductWithImagesAndShop,
} from '@e-shop-app/packages/types';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaCartArrowDown } from 'react-icons/fa';
import {
  LuChevronsLeft,
  LuChevronsRight,
  LuHeart,
  LuMapPin,
  LuMessageSquareText,
  LuPackage,
  LuWalletMinimal,
} from 'react-icons/lu';
import ReactImageMagnify from 'react-image-magnify';
import { Ratings } from '../common/Ratings';
import { Button, buttonVariants } from '../ui/button';
import { ProductCard } from '../common/cards/ProductCard';

type Props = {
  productDetails: TProductWithImagesAndShop;
};

const ProductsDetailsClientComponent = (props: Props) => {
  const { productDetails } = props;
  const [currentImage, setCurrentImage] = useState(
    productDetails.images[0].fileUrl,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    productDetails?.colors?.[0] || '',
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    productDetails?.sizes?.[0] || '',
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const [recommendedProducts, setRecommendedProducts] = useState<
    TProductWithImagesAndShop[]
  >([]);

  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceInfo();

  const userQuery = useQuery(getUserOptions());
  const currentUser = userQuery?.data;
  const kafkaEventSender = useSendKafkaEvent();

  const store = useAppStore((state) => state);
  const { removeFromWishList, cart, wishlist, addToCart, addToWishList } =
    store;

  const isInCart = cart.some((item) => item.id === productDetails.id);
  const isWishListed = wishlist.some((item) => item.id === productDetails.id);

  const prevImage = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentImage(productDetails.images[newIndex].fileUrl);
    }
  };

  const nextImage = () => {
    if (currentIndex < productDetails.images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentImage(productDetails.images[newIndex].fileUrl);
    }
  };

  const discountPercentage = Math.round(
    (((Number(productDetails?.regularPrice) || 0) -
      (Number(productDetails?.salePrice) || 0)) /
      (Number(productDetails?.regularPrice) || 1)) *
      100,
  );

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();

      query.set('priceRange', priceRange.join(','));
      query.set('page', '1');
      query.set('limit', '5');

      const response = await axiosInstance.get<
        TBaseServerResponseWithPagination<TProductWithImagesAndShop[]>
      >(`/product/get-filtered-products?${query.toString()}`);

      if (!response.data.success) {
        throw new Error('Failed to fetch recommended products');
      }

      setRecommendedProducts(response.data.data.data);
    } catch (e) {
      console.error('Error fetching recommended products:', e);
      setRecommendedProducts([]);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, []);

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
        {/* Left col */}
        <div className="p-4">
          <div className="relative w-full">
            {/* Main image */}
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: productDetails.title,
                  isFluidWidth: true,
                  src: currentImage || '/default-image.jpg',
                },
                largeImage: {
                  src: currentImage || '/default-image.jpg',
                  width: 1200,
                  height: 1200,
                },
                enlargedImageContainerDimensions: {
                  width: '150%',
                  height: '150%',
                },
                enlargedImageStyle: {
                  border: 'none',
                  boxShadow: 'none',
                },
                enlargedImagePosition: 'right',
              }}
            />
          </div>

          {/* Thumbnail images */}
          <div className="relative flex items-center gap-2 mt-4 overflow-hidden">
            {productDetails?.images?.length > 4 && (
              <button
                className="absolute left-0 z-10 p-2 bg-white rounded-full shadow-md"
                onClick={prevImage}
                disabled={currentIndex === 0}
              >
                <LuChevronsLeft size={24} />
              </button>
            )}

            <div className="flex gap-2 overflow-x-auto">
              {productDetails.images.map((image, index) => (
                <Image
                  key={image.id}
                  src={image.fileUrl}
                  alt={productDetails.title}
                  width={80}
                  height={80}
                  className={`size-20 object-cover cursor-pointer ${
                    index === currentIndex ? 'border-2 border-blue-500' : ''
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentImage(image.fileUrl);
                  }}
                />
              ))}
            </div>

            {productDetails?.images?.length > 4 && (
              <button
                className="absolute right-0 z-10 p-2 bg-white rounded-full shadow-md"
                onClick={nextImage}
                disabled={currentIndex === productDetails?.images.length - 1}
              >
                <LuChevronsRight size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Middle col */}
        <div className="p-4">
          <h1 className="text-xl mb-2 font-semibold">
            {productDetails?.title || 'Product Title'}
          </h1>

          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-1">
              <Ratings rating={productDetails?.ratings || 0} />
              <Link href={`#reviews`} className="text-blue-500 hover:underline">
                0 Reviews
              </Link>
            </div>

            <button
              className=""
              onClick={() =>
                isWishListed
                  ? removeFromWishList({
                      id: productDetails.id,
                      location,
                      deviceInfo,
                      user: currentUser,
                      sendEvent: kafkaEventSender.mutate,
                    })
                  : addToWishList({
                      product: productDetails,
                      deviceInfo,
                      location,
                      user: currentUser,
                      sendEvent: kafkaEventSender.mutate,
                    })
              }
            >
              <LuHeart
                size={25}
                fill={isWishListed ? 'red' : 'transparent'}
                className="cursor-pointer"
                color={isWishListed ? 'transparent' : '#777'}
              />
            </button>
          </div>

          <div className="py-2 border-b border-gray-200">
            <span className="text-gray-500 text-sm">Brand: </span>
            <span className="text-sm text-blue-500">
              {productDetails?.brand || 'N/A'}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-3xl font-bold text-orange-500">
              ${productDetails?.salePrice}
            </span>

            <div className="flex gap-2 pb-2 text-sm border-b border-b-slate-200">
              <span className="text-gray-400 line-through">
                ${productDetails?.regularPrice}
              </span>
              <span className="text-gray-500">-{discountPercentage}%</span>
            </div>

            <div className="mt-2">
              <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                {/* Color option */}

                {productDetails?.colors?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-gray-500">Color:</strong>
                    <div className="flex items-center gap-2">
                      {productDetails.colors.map((color) => (
                        <button
                          key={color}
                          className={`size-8 border-2 rounded-full cursor-pointer ${selectedColor === color ? 'border-gray-500 scale-110 shadow-md' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {productDetails?.sizes?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <strong className="text-sm text-gray-500">Sizes:</strong>
                    <div className="flex items-center gap-2">
                      {productDetails.sizes.map((size) => (
                        <button
                          key={size}
                          className={`px-4 py-1 rounded-md cursor-pointer ${selectedSize === size ? 'bg-gray-800 text-white' : 'bg-gray-300 text-black'}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-md">
                    <button
                      className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                      onClick={() =>
                        setQuantity((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      -
                    </button>
                    <span>{quantity}</span>
                    <button
                      className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md"
                      onClick={() => setQuantity((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>

                  {productDetails?.stock && productDetails.stock > 0 ? (
                    <span className="text-sm text-green-600">
                      In Stock ({productDetails.stock} available)
                    </span>
                  ) : (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                </div>

                <Button
                  variant={isInCart ? 'outline' : 'default'}
                  disabled={productDetails?.stock === 0 || isInCart}
                  className="mt-6"
                  onClick={() => {
                    addToCart({
                      location,
                      deviceInfo,
                      user: currentUser,
                      product: {
                        ...productDetails,
                        quantity,
                        selectedOptions: {
                          color: selectedColor,
                          size: selectedSize,
                        },
                      },
                      sendEvent: kafkaEventSender.mutate,
                    });
                  }}
                >
                  <FaCartArrowDown size={18} />
                  {isInCart ? 'Already in Cart' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right col/ seller information */}

        <div className="bg-[#fafafa] -mt-6">
          <div className="mb-1 p-3 border-b space-y-1 border-b-gray-100">
            <span className="text-sm text-gray-600">Delivery Options</span>
            <div className="flex items-center text-gray-600 gap-1">
              <LuMapPin size={18} className="ml-[-5px]" />
              <span className="text-lg font-normal">{`${location?.city} ${location?.country}`}</span>
            </div>
          </div>

          <div className="mb-1 px-3 pb-1 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Return & Warranty</span>
            <div className="flex items-center text-gray-600 gap-1">
              <LuPackage size={18} className="ml-[-5px]" />
              <span className="text-sm font-normal"> 7 days returns</span>
            </div>

            <div className="flex items-center py-2 text-gray-600 gap-1">
              <LuWalletMinimal size={18} className="ml-[-5px]" />
              <span className="text-sm font-normal">
                Warranty not available
              </span>
            </div>
          </div>

          <div className="px-3 py-1">
            <div className="w-[85%] rounded-lg">
              {/* Sold by section */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600 font-light">
                    Sold by
                  </span>
                  <span className="block max-w-[150px] truncate font-semibold text-lg">
                    {productDetails?.shop?.name}
                  </span>
                </div>

                <Link
                  href={`#`}
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <LuMessageSquareText />
                  Chat Now
                </Link>
              </div>

              {/* Seller performance stats */}
              <div className="grid grid-cols-3 gap-2 border-t border-t-gray-200 mt-3 pt-3">
                <div>
                  <p className="text-[12px] text-gray-500">
                    Positive Seller Ratings
                  </p>
                  <p className="text-lg font-semibold">88%</p>
                </div>

                <div>
                  <p className="text-[12px] text-gray-500">Ship on Time</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>

                <div>
                  <p className="text-[12px] text-gray-500">
                    Chat response rate
                  </p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
              </div>

              <div className="text-center mt-4 border-t border-t-gray-200 pt-2">
                <Link
                  href={`${Routes.shop}/${productDetails?.shop.id}`}
                  className={buttonVariants({
                    className: 'w-full',
                  })}
                >
                  Go to store
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="w-[90%] lg:w-[80%] mx-auto mt-5">
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className="text-lg font-semibold">
            Product details of {productDetails?.title}
          </h3>

          <div
            className="prose prose-sm text-slate-600 max-w-none"
            dangerouslySetInnerHTML={{
              __html: productDetails?.detailedDescription || '',
            }}
          />
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="bg-background min-h-[50vh] h-full mt-5 p-5">
          <h3 className="text-lg font-semibold">
            Ratings & Reviews of {productDetails?.title}
          </h3>

          <p className="text-center pt-14">No reviews available yet!</p>
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="w-full h-full my-5 p-5">
          <h3 className="text-xl font-semibold mb-2">You may also like</h3>

          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {recommendedProducts?.map((product) => {
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentUser={currentUser}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsDetailsClientComponent;
