'use client';

import {
  getUserAddressOptions,
  getUserOptions,
} from '@/actions/queries/base-queries';
import { Routes } from '@/configs/routes';
import { useDeviceInfo } from '@/hooks/use-device-tracking';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { useAppStore } from '@/store';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { LuChevronRight } from 'react-icons/lu';

import {
  useBaseMutation,
  useSendKafkaEvent,
} from '@/actions/mutations/base.mutation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { paymentMethods } from '@e-shop-app/packages/constants';
import Image from 'next/image';
import { BiTrash } from 'react-icons/bi';
import { errorToast } from '@/lib/utils';
import { TCreatePaymentSessionSchema } from '@e-shop-app/packages/zod-schemas';
import { useRouter } from 'next/navigation';

const tableHeadings = ['Product', 'Quantity', 'Price', 'Action'];

const CartPage = () => {
  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceInfo();

  const userQuery = useQuery(getUserOptions());
  const currentUser = userQuery?.data;

  const [discountedProductId, setDiscountedProductId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [coupon, setCoupon] =
    useState<TCreatePaymentSessionSchema['coupon']>(null);
  const router = useRouter();

  const userAddressQuery = useQuery(getUserAddressOptions());
  const userAddresses = userAddressQuery?.data || [];
  const defaultAddress =
    selectedAddressId ||
    userAddresses.find((address) => address.isDefault)?.id ||
    '';

  const paymentSessionMutation = useBaseMutation<
    TCreatePaymentSessionSchema,
    { sessionId: string }
  >({
    endpoint: '/order/create-payment-session',
    defaultMessage: 'Failed to create payment session. Please try again later.',
  });

  const kafkaEventSender = useSendKafkaEvent();

  const store = useAppStore((state) => state);
  const { removeFromCart, cart, decreaseQuantity, increaseQuantity } = store;

  const cartTotal = cart.reduce((total, item) => {
    const itemTotal = (Number(item?.salePrice) || 0) * (item.quantity || 1);
    return total + itemTotal;
  }, 0);

  const handleCouponApply = () => {
    //
  };

  const createPaymentSession = async () => {
    try {
      const response = await paymentSessionMutation.mutateAsync({
        cart,
        selectedAddressId,
        coupon,
      });

      if (!response?.success || !response?.data?.sessionId) {
        throw new Error(
          response?.message || 'Failed to create payment session',
        );
      }

      router.push(`${Routes.checkout}?sessionId=${response.data.sessionId}`);
    } catch (error) {
      errorToast(
        error,
        'Failed to create payment session. Please try again later.',
      );
    }
  };

  const isCreatingSession = paymentSessionMutation.isPending;

  return (
    <div className="w-full bg-background">
      <div className="md:w-[80%] w-[95%] py-6 mx-auto min-h-screen">
        {/* Bread crumbs */}
        <h2 className="text-2xl py-2 font-semibold font-poppins">
          Your Shopping Cart
        </h2>

        <div className="flex items-center">
          <Link href={Routes.home} className="text-primary cursor-pointer">
            Home
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>Shopping Cart</span>
        </div>

        {/* If cart is empty */}
        {cart.length === 0 || !currentUser ? (
          <div className="flex flex-col items-center justify-center border min-h-[200px] gap-4 mt-10">
            <h3 className="text-base font-poppins text-muted-foreground">
              Your shopping cart is empty!. Start adding products
            </h3>
            <Link href={Routes.home} className="text-primary cursor-pointer">
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="flex flex-row gap-10 mt-10">
            {/* Cart table */}{' '}
            <Table className="border">
              <TableHeader>
                <TableRow>
                  {tableHeadings.map((heading) => (
                    <TableHead className="bg-muted" key={heading}>
                      {heading}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium flex items-start gap-4 text-lg">
                      <Image
                        src={item.images[0].fileUrl}
                        alt={item.title}
                        width={50}
                        height={50}
                        className="size-[50px] rounded-lg object-cover"
                      />

                      <div className="flex flex-col gap-y-0.5">
                        {item.title}

                        {item?.selectedOptions ? (
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            {item.selectedOptions?.color && (
                              <span>
                                Color:{' '}
                                <span
                                  className="size-[12px] rounded-full inline-block"
                                  style={{
                                    backgroundColor: item.selectedOptions.color,
                                  }}
                                />
                              </span>
                            )}

                            {item.selectedOptions?.size && (
                              <span>
                                Size:{' '}
                                <span className="font-medium">
                                  {item.selectedOptions.size}
                                </span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            No options selected
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-center items-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]">
                        <button
                          className="text-black cursor-pointer text-xl"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          -
                        </button>
                        <span className="px-4">{item.quantity ?? 1}</span>
                        <button
                          className="text-black cursor-pointer text-xl"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          +
                        </button>
                      </div>
                    </TableCell>

                    <TableCell>
                      {item.id === discountedProductId ? (
                        <div className="flex flex-col items-center">
                          <span className="line-through text-gray-500 text-sm">
                            ${item.salePrice}
                          </span>
                          <span className="text-green-600 font-semibold">
                            $
                            {(
                              (Number(item.salePrice) *
                                (100 - discountPercent)) /
                              100
                            ).toFixed(2)}{' '}
                            ({discountPercent}% off)
                          </span>
                        </div>
                      ) : (
                        <span>${item.salePrice}</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant={'ghost'}
                        className="text-red-400 hover:text-red-300"
                        onClick={() =>
                          removeFromCart({
                            location,
                            deviceInfo,
                            user: currentUser,
                            id: item.id,
                            sendEvent: kafkaEventSender.mutate,
                          })
                        }
                      >
                        <BiTrash size={18} /> Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="font-semibold text-xl">
                    ${cartTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            {/* Other side */}
            <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9]">
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-[#010f1c] font-medium pb-1">
                  <span className="font-poppins">
                    Discount (${discountPercent})
                  </span>
                  <span className="text-green-600">
                    - ${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[#010f1c] font-medium pb-3">
                <span>Subtotal</span>
                <span className="font-semibold">
                  ${(cartTotal - discountAmount).toFixed(2)}
                </span>
              </div>

              <hr className="my-2 text-slate-200" />

              <div className="mb-4">
                <h4 className="mb-2 text-sm">Have a coupon?</h4>
                <div className="flex">
                  <Input
                    // value={coupon?.code || ''}
                    // onChange={(e) =>
                    //   setCoupon((prev) => ({ ...prev, code: e.target.value }))
                    // }
                    placeholder="Enter coupon code here"
                    className="h-10"
                  />
                  <Button onClick={handleCouponApply}>Apply</Button>
                </div>
              </div>

              <hr className="my-2 text-slate-200" />

              <div className="mb-4">
                <h4 className="mb-2 text-sm">Select shipping address</h4>

                {userAddressQuery?.isLoading ? (
                  <p>Loading addresses...</p>
                ) : userAddresses.length === 0 ? (
                  <p>
                    No addresses found. Please add an address in your profile.
                  </p>
                ) : (
                  <Select
                    value={defaultAddress}
                    onValueChange={setSelectedAddressId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a shipping address" />
                    </SelectTrigger>

                    <SelectContent className="max-h-70">
                      {userAddresses.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label} - {item.name} - {item.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <hr className="my-2 text-slate-200" />

              <div className="mb-4">
                <h4 className="mb-2 text-sm">Select Payment options</h4>

                <Select
                  value={selectedPaymentMethod}
                  onValueChange={setSelectedPaymentMethod}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>

                  <SelectContent className="max-h-70">
                    {paymentMethods.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <hr className="my-2 text-slate-200" />

              <div className="flex justify-between items-center text-[#010f1c] font-medium pb-3">
                <span>Total</span>
                <span className="font-semibold">
                  ${(cartTotal - discountAmount).toFixed(2)}
                </span>
              </div>

              <Button
                isLoading={isCreatingSession}
                variant="primary2Dark"
                className="w-full"
                onClick={createPaymentSession}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
