'use client';

import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import { getCategories } from '@/actions/queries/config-queries';
import CustomFormField from '@/components/common/CustomFomField';
import { CustomProperties } from '@/components/common/CustomProperties';
import { CustomSpecifications } from '@/components/common/CustomSpecifications';
import { Button } from '@/components/ui/button';
import { Routes } from '@/configs/routes';
import { YesNo } from '@e-shop-app/packages/constants';
import {
  productSchema,
  TProductSchema,
  TUploadProductImageResponseSchema,
} from '@e-shop-app/packages/zod-schemas';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { ProductImages } from './components/ProductImages';
import { toast } from 'sonner';
import { useBaseMutation } from '@/actions/mutations/base.mutation';
import { errorToast } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const CreateProductPage = () => {
  const [isChanged, setIsChanged] = useState(true);
  const [images, setImages] = useState<
    (TUploadProductImageResponseSchema | null)[]
  >([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<TProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: '',
      // warranty: '',
      slug: '',
      brand: '',
      cashOnDelivery: 'Yes',
      category: '',
      detailedDescription: '',
      regularPrice: '',
      salePrice: '',
      stock: '',
      colors: [],
      sizes: [],
      customSpecifications: [],
      customProperties: [],
    },
  });

  const selectedCategory = useWatch({
    control: form.control,
    name: 'category',
  });

  const categoriesQuery = useQuery(getCategories());
  const categories = categoriesQuery.data?.categories || [];
  const subCategoriesData = categoriesQuery.data?.subCategories || {};

  const subCategories = useMemo(() => {
    if (!subCategoriesData) return [];
    return selectedCategory
      ? subCategoriesData[selectedCategory as string] || []
      : [];
  }, [selectedCategory, subCategoriesData]);

  const createProductMutation = useBaseMutation<
    TProductSchema & {
      images: TUploadProductImageResponseSchema[];
    },
    unknown
  >({
    endpoint: '/product/create-product',
  });

  async function onSubmit(data: TProductSchema) {
    const { salePrice, regularPrice } = data;

    if (salePrice && regularPrice && Number(salePrice) > Number(regularPrice)) {
      form.setError('salePrice', {
        type: 'manual',
        message: 'Sale price cannot be greater than regular price',
      });
      return;
    }

    const filteredImages = images.filter(
      (img): img is TUploadProductImageResponseSchema => img !== null,
    );

    if (!filteredImages || filteredImages.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    startTransition(async () => {
      try {
        const productResponse = await createProductMutation.mutateAsync({
          ...data,
          images: filteredImages,
        });

        if (!productResponse.success) {
          toast.error(productResponse.message || 'Failed to create product');
          return;
        }

        toast.success('Product created successfully');
        form.reset();
        setImages([]);
        setIsChanged(false);
        router.push(Routes.dashboard.allProducts);
      } catch (error) {
        errorToast(error, 'Failed to create product. Please try again');
      }
    });
  }

  const handleSaveDraft = () => {
    form.reset();
    setImages([]);
    setIsChanged(false);
  };

  const isLoadingCreate = isPending || createProductMutation.isPending;

  return (
    <section className="w-full mx-auto p-8 shadow-md rounded-lg dark">
      {/* Heading and breadcrumb */}

      <h2 className="text-2xl py-2 font-semibold font-poppins text-white">
        Create New Product
      </h2>

      {/* BreadCrumbs */}
      <div className="flex items-center">
        <Link
          href={Routes.dashboard.base}
          className="text-[#80Deea] cursor-pointer"
        >
          Dashboard
        </Link>
        <LuChevronRight size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>

      {/* Content layout */}

      <div className="py-4 w-full flex gap-8">
        {/*  Left side */}
        <aside className="md:w-[35%]">
          <ProductImages
            images={images}
            onUpdateImages={(updatedImages) => {
              setImages(updatedImages);
              // setIsChanged(true);
            }}
          />
        </aside>

        <aside className="md:w-[65%]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First batch */}
                <div className="w-full space-y-4 border-r pr-6 border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomFormField
                      control={form.control}
                      name="title"
                      label="Product Title"
                      placeHolder="Enter product title"
                      isRequired
                    />

                    <CustomFormField
                      control={form.control}
                      name="brand"
                      label="Brand"
                      placeHolder="e.g Apple"
                    />
                  </div>

                  <CustomFormField
                    control={form.control}
                    name="description"
                    type="text-area"
                    label="Short Description (Max 150 words)"
                    placeHolder="Enter product description for quick view"
                    isRequired
                  />

                  <CustomFormField
                    control={form.control}
                    name="tags"
                    label="Tags"
                    placeHolder="e.g apple, flagship, electronics"
                    isRequired
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomFormField
                      control={form.control}
                      name="warranty"
                      label="Warranty"
                      placeHolder="e.g 1 Year/ No Warranty"
                    />

                    <CustomFormField
                      control={form.control}
                      name="slug"
                      label="Slug"
                      placeHolder="e.g my-product"
                      isRequired
                    />
                  </div>

                  <CustomSpecifications
                    label="Custom Specifications"
                    control={form.control}
                    name="customSpecifications"
                  />

                  <CustomProperties
                    label="Custom Properties"
                    control={form.control}
                    name="customProperties"
                  />

                  <CustomFormField
                    control={form.control}
                    name="stock"
                    label="Stock"
                    placeHolder="Enter stock quantity. e.g 100"
                    type="number"
                    isRequired
                  />

                  <CustomFormField
                    control={form.control}
                    name="colors"
                    label="Colors"
                    type="color-selector"
                  />

                  <CustomFormField
                    control={form.control}
                    name="sizes"
                    label="Available Sizes"
                    type="size-selector"
                    isRequired
                  />
                </div>

                {/* Second batch */}
                <div className="w-full space-y-4">
                  {categoriesQuery.isLoading ? (
                    <p className="text-gray-400">Loading categories...</p>
                  ) : categoriesQuery.isError ? (
                    <p className="text-red-500">Failed to load categories</p>
                  ) : !categories || categories.length === 0 ? (
                    <p className="text-gray-400">No categories available</p>
                  ) : (
                    <CustomFormField
                      control={form.control}
                      name="category"
                      label="Category"
                      type="select"
                      options={
                        categories?.map((category) => ({
                          label: category,
                          value: category,
                        })) || []
                      }
                      isRequired
                    />
                  )}

                  <CustomFormField
                    control={form.control}
                    name="subCategory"
                    label="SubCategory"
                    type="select"
                    options={
                      subCategories?.map((subCategory) => ({
                        label: subCategory,
                        value: subCategory,
                      })) || []
                    }
                    isRequired
                  />

                  <CustomFormField
                    control={form.control}
                    name="detailedDescription"
                    label="Detailed Description"
                    placeHolder="Enter a detailed description of the product"
                    type="rich-text-editor"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomFormField
                      control={form.control}
                      name="cashOnDelivery"
                      label="Cash on Delivery"
                      type="select"
                      options={YesNo.map((item) => ({
                        label: item,
                        value: item,
                      }))}
                      isRequired
                    />
                    <CustomFormField
                      control={form.control}
                      name="videoUrl"
                      label="Video URL"
                      placeHolder="e.g., https://www.youtube.com/embed/examplevideo"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomFormField
                      control={form.control}
                      name="regularPrice"
                      label="Regular Price"
                      placeHolder="e.g., 499.99"
                      type="number"
                    />
                    <CustomFormField
                      control={form.control}
                      name="salePrice"
                      label="Sale Price"
                      placeHolder="e.g., 499.99"
                      type="number"
                    />
                  </div>

                  <CustomFormField
                    control={form.control}
                    name="discountCodes"
                    label="Discount Codes"
                    placeHolder="e.g., SUMMER21, WELCOME10"
                    type="discount-code-selector"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {isChanged && (
                  <Button
                    type="button"
                    variant="outlineGray"
                    size="lg"
                    className="w-auto"
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </Button>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full max-w-[200px]"
                  // onClick={handleSaveDraft}
                  isLoading={isLoadingCreate}
                >
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </aside>
      </div>
    </section>
  );
};

export default CreateProductPage;
