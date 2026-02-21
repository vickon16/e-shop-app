'use client';

import { getCategoriesOptions } from '@/actions/queries/base-queries';
import { ProductCard } from '@/components/common/cards/ProductCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Routes } from '@/configs/routes';
import { axiosInstance } from '@/lib/axios';
import { defaultColors, defaultSizes } from '@e-shop-app/packages/constants';
import {
  TBaseServerResponseWithPagination,
  TProductWithImagesAndShop,
} from '@e-shop-app/packages/types';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { Range } from 'react-range';

const MIN = 0;
const MAX = 1199;

const OffersPage = () => {
  const [priceRange, setPriceRange] = useState([MIN, MAX]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([MIN, MAX]);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [products, setProducts] = useState<TProductWithImagesAndShop[]>([]);

  const router = useRouter();

  const categoriesQuery = useQuery(getCategoriesOptions());
  const categories = categoriesQuery.data?.categories || [];

  const getQuery = () => {
    const query = new URLSearchParams();
    query.set('priceRange', priceRange.join(','));
    query.set('page', page.toString());
    query.set('limit', '10');

    if (selectedCategories.length > 0) {
      query.set('categories', selectedCategories.join(','));
    }
    if (selectedSizes.length > 0) {
      query.set('sizes', selectedSizes.join(','));
    }
    if (selectedColors.length > 0) {
      query.set('colors', selectedColors.join(','));
    }

    return query.toString();
  };

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);
    try {
      const query = getQuery();
      const response = await axiosInstance.get<
        TBaseServerResponseWithPagination<TProductWithImagesAndShop[]>
      >(`/product/get-filtered-products?type=event&${query}`);

      if (!response.data.success) {
        throw new Error('Failed to fetch products');
      }

      setProducts(response.data.data.data);
      setTotalPages(response.data.data.meta.pageCount);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsProductLoading(false);
    }
  };

  useEffect(() => {
    const query = getQuery();
    const newUrl = `/offer?${decodeURIComponent(query)}`;
    router.replace(newUrl, { scroll: false });

    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedSizes, selectedColors, page]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <div className="pb-[50px] space-y-2">
          <h1 className="md:pt-[40px] font-medium text-[44px] leading-1 mb-[24px] font-oregano">
            All Products
          </h1>

          <div className="flex items-center">
            <Link
              href={Routes.home}
              className="text-muted-foreground cursor-pointer"
            >
              Home
            </Link>
            <LuChevronRight size={20} className="opacity-[.8]" />
            <span>All Products</span>
          </div>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[300px] rounded bg-white p-4 space-y-6 shadow-md">
            <h3 className="text-lg font-poppins font-medium">Price filters</h3>

            <div className="ml-2">
              <Range
                step={1}
                min={MIN}
                max={MAX}
                values={tempPriceRange}
                onChange={(values) => setTempPriceRange(values)}
                renderTrack={({ props, children }) => {
                  return (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                      }}
                      className="bg-blue-200 relative h-[6px] w-full"
                    >
                      {children}
                    </div>
                  );
                }}
                renderThumb={({ props }) => {
                  const { key, ...rest } = props;

                  return (
                    <div
                      key={key}
                      {...rest}
                      className="size-[16px] bg-blue-600 rounded-full shadow-md"
                    />
                  );
                }}
              />
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-600">
                ${tempPriceRange[0]} - ${tempPriceRange[1]}
              </div>

              <Button
                size="xs"
                variant="primary2Dark"
                className="rounded-none"
                onClick={() => setPriceRange(tempPriceRange)}
              >
                Apply
              </Button>
            </div>

            {/* Categories filter */}
            <h3 className="text-sm font-poppins font-semibold border-b border-b-slate-300 pb-1">
              Categories
            </h3>

            <ul className="space-y-2 !mt-3 overflow-y-auto max-h-[200px]">
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

            {/* Colors filter */}
            <h3 className="text-sm font-poppins font-semibold border-b border-b-slate-300 pb-1">
              Colors
            </h3>

            <ul className="space-y-2 !mt-3 overflow-y-auto max-h-[200px]">
              {defaultColors?.map((color) => (
                <li key={color.name}>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <Checkbox
                      checked={selectedColors.includes(color.value)}
                      onCheckedChange={() => toggleColor(color.value)}
                    />
                    <div
                      className="size-4 rounded-full border-2"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.name}
                  </label>
                </li>
              ))}
            </ul>

            {/* Colors filter */}
            <h3 className="text-sm font-poppins font-semibold border-b border-b-slate-300 pb-1">
              Sizes
            </h3>

            <ul className="space-y-2 !mt-3 overflow-y-auto max-h-[200px]">
              {defaultSizes?.map((size) => (
                <li key={size}>
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <Checkbox
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={() => toggleSize(size)}
                    />
                    {size}
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          {/* Products grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isProductLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-full h-[300px] bg-gray-300 animate-pulse rounded"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="w-full flex items-center justify-center text-muted-foreground">
                No products found.
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

export default OffersPage;
