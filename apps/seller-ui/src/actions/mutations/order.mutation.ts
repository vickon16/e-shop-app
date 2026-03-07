import { axiosInstance } from '@/lib/axios';
import { TBaseServerResponse } from '@e-shop-app/packages/types';
import { TUpdateOrderStatusSchema } from '@e-shop-app/packages/zod-schemas';

export const updateOrderStatusAction = async ({
  orderId,
  orderStatus,
}: {
  orderId: string;
  orderStatus: TUpdateOrderStatusSchema['orderStatus'];
}) => {
  const response = await axiosInstance.put<TBaseServerResponse<null>>(
    `/order/update-status/${orderId}`,
    { orderStatus },
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to update order status');
  }

  return response.data;
};
