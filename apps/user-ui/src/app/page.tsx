'use client';

import { getUserOptions } from '@/actions/queries/base-queries';
import {
  getProductOffersOptions,
  getProductsQueryOptions,
} from '@/actions/queries/product-queries';
import { getTopShopsQueryOptions } from '@/actions/queries/shop-queries';
import { ProductCard } from '@/components/common/cards/ProductCard';
import { ShopCard } from '@/components/common/cards/ShopCard';
import { Hero } from '@/components/dashboard/Hero';
import { SectionTitle } from '@/components/dashboard/SectionTitle';
import { useQuery } from '@tanstack/react-query';

const Page = () => {
  const allProductsQuery = useQuery(getProductsQueryOptions('top-sales'));
  const allProductsData = allProductsQuery.data;

  const latestProductsQuery = useQuery(getProductsQueryOptions('latest'));
  const latestProductsData = latestProductsQuery.data;

  const topShopsQuery = useQuery(getTopShopsQueryOptions());
  const topShopsData = topShopsQuery.data;

  const topOffersQuery = useQuery(getProductOffersOptions());
  const topOffersData = topOffersQuery.data;

  const userQuery = useQuery(getUserOptions());
  const currentUser = userQuery?.data;

  return (
    <div className="">
      <Hero />

      <div className="md:w-[80%] w-[90%] my-10 p-6 m-auto">
        <div className="mb-6">
          <SectionTitle title="Suggested Products" />
        </div>

        {allProductsQuery.isLoading ||
        userQuery.isLoading ||
        userQuery.isError ||
        !currentUser ||
        allProductsQuery.isError ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => {
              return (
                <div
                  key={index}
                  className="h-[250px] bg-gray-200 animate-pulse rounded-xl"
                />
              );
            })}
          </div>
        ) : allProductsData?.paginatedResult?.data?.length === 0 ? (
          <p className="text-center text-gray-500 border min-h-[100px] flex items-center justify-center">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {allProductsData?.paginatedResult.data.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>

      <div className="md:w-[80%] w-[90%] my-10 bg-white p-6 rounded-lg m-auto">
        <div className="mb-6">
          <SectionTitle title="Latest Products" />
        </div>

        {latestProductsQuery.isLoading ||
        userQuery.isLoading ||
        latestProductsQuery.isError ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => {
              return (
                <div
                  key={index}
                  className="h-[250px] bg-gray-200 animate-pulse rounded-xl"
                />
              );
            })}
          </div>
        ) : latestProductsData?.paginatedResult?.data?.length === 0 ? (
          <p className="text-center text-gray-500 border min-h-[100px] flex items-center justify-center">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {latestProductsData?.paginatedResult.data.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>

      <div className="md:w-[80%] w-[90%] my-10 p-6 m-auto">
        <div className="mb-6">
          <SectionTitle title="Top shops" />
        </div>

        {topShopsQuery.isLoading ||
        userQuery.isLoading ||
        topShopsQuery.isError ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => {
              return (
                <div
                  key={index}
                  className="h-[250px] bg-gray-200 animate-pulse rounded-xl"
                />
              );
            })}
          </div>
        ) : topShopsData?.length === 0 ? (
          <p className="text-center text-gray-500 border min-h-[100px] flex items-center justify-center">
            No shops found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {topShopsData?.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>

      <div className="md:w-[80%] w-[90%] my-10 p-6 m-auto">
        <div className="mb-6">
          <SectionTitle title="Top Offers" />
        </div>

        {topOffersQuery.isLoading ||
        userQuery.isLoading ||
        topOffersQuery.isError ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => {
              return (
                <div
                  key={index}
                  className="h-[250px] bg-gray-200 animate-pulse rounded-xl"
                />
              );
            })}
          </div>
        ) : topOffersData?.data.length === 0 ? (
          <p className="text-center text-gray-500 border min-h-[100px] flex items-center justify-center">
            No shops found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {topOffersData?.data.map((offer) => (
              <ProductCard key={offer.id} product={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
