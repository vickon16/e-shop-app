'use client';

import { getCategoriesOptions } from '@/actions/queries/base-queries';
import { ShopCard } from '@/components/common/cards/ShopCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Routes } from '@/configs/routes';
import { axiosInstance } from '@/lib/axios';
import { countryList } from '@e-shop-app/packages/constants';
import {
  TBaseServerResponseWithPagination,
  TShopWithRelations,
} from '@e-shop-app/packages/types';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuChevronRight } from 'react-icons/lu';

const ShopsPage = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [shops, setShops] = useState<TShopWithRelations[]>([]);

  const router = useRouter();

  const categoriesQuery = useQuery(getCategoriesOptions());
  const categories = categoriesQuery.data?.categories || [];

  const getQuery = () => {
    const query = new URLSearchParams();
    query.set('page', page.toString());
    query.set('limit', '10');

    if (selectedCountries.length > 0) {
      query.set('countries', selectedCountries.join(','));
    }

    if (selectedCategories.length > 0) {
      query.set('categories', selectedCategories.join(','));
    }

    return query.toString();
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = getQuery();
      const response = await axiosInstance.get<
        TBaseServerResponseWithPagination<TShopWithRelations[]>
      >(`/product/get-filtered-shops?${query}`);

      if (!response.data.success) {
        throw new Error('Failed to fetch shops');
      }

      setShops(response.data.data.data);
      setTotalPages(response.data.data.meta.pageCount);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    const query = getQuery();
    const newUrl = `/shop?${decodeURIComponent(query)}`;
    router.replace(newUrl, { scroll: false });

    fetchFilteredShops();
  }, [selectedCountries, selectedCategories, page]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );
  };

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <div className="pb-[50px] space-y-2">
          <h1 className="md:pt-[40px] font-medium text-[44px] leading-1 mb-[24px] font-oregano">
            All Shops
          </h1>

          <div className="flex items-center">
            <Link
              href={Routes.home}
              className="text-muted-foreground cursor-pointer"
            >
              Home
            </Link>
            <LuChevronRight size={20} className="opacity-[.8]" />
            <span>All Shops</span>
          </div>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[300px] rounded bg-white p-4 space-y-6 shadow-md">
            {/* Categories filter */}
            <h3 className="text-sm font-poppins font-semibold border-b border-b-slate-300 pb-1">
              Categories
            </h3>

            <ul className="space-y-2 !mt-3 overflow-y-auto max-h-[300px]">
              {categoriesQuery.isLoading ? (
                <p>Loading...</p>
              ) : (
                categories?.map((category) => (
                  <li
                    key={category}
                    className="flex text-sm items-center gap-2"
                  >
                    <label className="flex items-center gap-3 text-gray-700">
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      {category}
                    </label>
                  </li>
                ))
              )}
            </ul>

            <h3 className="text-sm font-poppins font-semibold border-b border-b-slate-300 pb-1">
              Countries
            </h3>

            <ul className="space-y-2 !mt-3 overflow-y-auto max-h-[300px]">
              {countryList?.map((country) => (
                <li
                  key={country.code}
                  className="flex text-sm items-center gap-2"
                >
                  <label className="flex items-center gap-3 text-gray-700">
                    <Checkbox
                      checked={selectedCountries.includes(country.code)}
                      onCheckedChange={() => toggleCountry(country.code)}
                    />
                    {country.name}
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          {/* Shops grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isShopLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-full h-[300px] bg-gray-300 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {shops?.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <p className="w-full flex items-center justify-center text-muted-foreground">
                No shops found.
              </p>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6 gap-2">
                {Array.from({ length: Math.min(totalPages, 6) }).map(
                  (_, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={page === index + 1 ? 'default' : 'outline'}
                      onClick={() => setPage(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopsPage;
