'use client';

import { getUserOptions } from '@/actions/queries/base-queries';
import { getProductsQueryOptions } from '@/actions/queries/product-queries';
import { ProductCard } from '@/components/common/cards/ProductCard';
import { Hero } from '@/components/dashboard/Hero';
import { SectionTitle } from '@/components/dashboard/SectionTitle';
import { useQuery } from '@tanstack/react-query';

const Page = () => {
  // const allProductsQuery = useQuery(getProductsQueryOptions('top-sales'));
  const latestProductsQuery = useQuery(getProductsQueryOptions('latest'));
  const latestProductsData = latestProductsQuery.data;

  const userQuery = useQuery(getUserOptions());
  const currentUser = userQuery?.data;

  return (
    <div className="">
      <Hero />

      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {latestProductsQuery.isLoading ||
          userQuery.isLoading ||
          userQuery.isError ||
          !currentUser ||
          latestProductsQuery.isError
            ? Array.from({ length: 10 }).map((_, index) => {
                return (
                  <div
                    key={index}
                    className="h-[250px] bg-gray-200 animate-pulse rounded-xl"
                  />
                );
              })
            : latestProductsData?.paginatedResult.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentUser={currentUser}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
