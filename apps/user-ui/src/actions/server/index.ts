'use server';

import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TProductWithImagesAndShop,
} from '@e-shop-app/packages/types';

export async function fetchProductDetails(slug: string) {
  try {
    const response = await axiosInstance.get<
      TBaseServerResponse<TProductWithImagesAndShop>
    >(`/product/get-product-by-slug/${slug}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || 'Failed to fetch product details',
      );
    }

    return response.data.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    return null;
  }
}
