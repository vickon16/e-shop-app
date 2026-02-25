import { fetchProductDetails } from '@/actions/server';
import ProductsDetailsClientComponent from '@/components/products/ProductsDetailsClientComponent';
import { Metadata } from 'next';
import React from 'react';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const productDetails = await fetchProductDetails(params.slug);
  const title = `${productDetails?.title || 'Default Product'} | Vicy E-Shop Marketplace`;
  const description = `${productDetails?.description || 'Discover high-quality products on Vicy E-shop Marketplace'} `;
  const images = [productDetails?.images?.[0]?.fileUrl || '/default-image.jpg'];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

const ProductSlugPage = async (props: Props) => {
  const params = await props.params;

  const productDetails = await fetchProductDetails(params.slug);

  if (!productDetails) {
    return <div>Product not found</div>;
  }

  return <ProductsDetailsClientComponent productDetails={productDetails} />;
};

export default ProductSlugPage;
