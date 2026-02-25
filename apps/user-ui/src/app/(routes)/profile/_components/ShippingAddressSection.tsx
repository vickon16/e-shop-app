'use client';

import { GET_USER_ADDRESS } from '@/actions/base-action-constants';
import {
  useBaseMutation,
  useDeleteUserAddress,
} from '@/actions/mutations/base.mutation';
import { getUserAddressOptions } from '@/actions/queries/base-queries';
import CustomFormField from '@/components/common/CustomFomField';
import CustomModal from '@/components/common/CustomModal';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { errorToast } from '@/lib/utils';
import { countryList } from '@e-shop-app/packages/constants';
import {
  shippingAddressSchema,
  TShippingAddressSchema,
} from '@e-shop-app/packages/zod-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { BiEdit } from 'react-icons/bi';
import { LuMapPin, LuPlus, LuTrash } from 'react-icons/lu';
import { toast } from 'sonner';

export const ShippingAddressSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const shippingMutation = useBaseMutation<TShippingAddressSchema, null>({
    endpoint: '/auth/create-user-address',
    defaultMessage: 'Failed to add shipping address',
  });

  const deleteAddressMutation = useDeleteUserAddress();

  const form = useForm<TShippingAddressSchema>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      label: 'Home',
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: 'false',
    },
  });

  async function onSubmit(data: TShippingAddressSchema) {
    startTransition(async () => {
      try {
        const response = await shippingMutation.mutateAsync(data);

        if (!response.success) {
          toast.error(response.message || 'Failed to add shipping address');
          return;
        }

        await queryClient.invalidateQueries({ queryKey: [GET_USER_ADDRESS] });
        toast.success('Shipping address added successfully');
        form.reset();
        setShowModal(false);
      } catch (error) {
        errorToast(error, 'Failed to add shipping address. Please try again');
      }
    });
  }

  async function deleteAddress(addressId: string) {
    startTransition(async () => {
      try {
        const response = await deleteAddressMutation.mutateAsync(addressId);

        if (!response.success) {
          toast.error(response.message || 'Failed to delete address');
          return;
        }

        await queryClient.invalidateQueries({ queryKey: [GET_USER_ADDRESS] });
        toast.success('Address deleted successfully');
      } catch (error) {
        errorToast(error, 'Failed to delete address. Please try again');
      }
    });
  }

  const isLoading = isPending || shippingMutation.isPending;

  const userAddressQuery = useQuery(getUserAddressOptions());
  const userAddresses = userAddressQuery?.data || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Saved Address</h2>
        <Button variant="ghost" onClick={() => setShowModal(true)}>
          <LuPlus className="size-4" />
          Add New Address
        </Button>
      </div>

      {/* Address List */}
      <div>
        {userAddressQuery.isLoading ? (
          <p className="text-gray-500">Loading addresses...</p>
        ) : userAddresses.length === 0 ? (
          <p className="text-gray-500">No saved addresses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userAddresses.map((address) => (
              <div
                key={address.id}
                className={`border border-gray-200 rounded-md p-4 relative`}
              >
                {address.isDefault && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5  rounded-full">
                    Default
                  </span>
                )}

                <div className="flex items-start gap-2 mt-5 text-sm text-gray-700">
                  <LuMapPin className="size-5 shrink-0 mt-0.5 text-gray-500" />
                  <div className="">
                    <p className="font-medium text-gray-700">
                      {address.label} - {address.name}
                    </p>
                    <p className="text-gray-600">
                      {address.street}, {address.city}, {address.state},{' '}
                      {address.zipCode}, {address.country}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button variant="outline" size="icon">
                    <BiEdit className="size-4" />
                  </Button>
                  <Button
                    variant="outlineDestructive"
                    size="icon"
                    onClick={() => deleteAddress(address.id)}
                  >
                    <LuTrash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CustomModal open={showModal} onOpenChange={setShowModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Shipping Address
            </h3>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <CustomFormField
                  control={form.control}
                  name="label"
                  label="Label"
                  type="select"
                  options={[
                    { label: 'Home', value: 'Home' },
                    { label: 'Work', value: 'Work' },
                    { label: 'Other', value: 'Other' },
                  ]}
                  placeHolder="Enter address label"
                  isRequired
                />

                <CustomFormField
                  control={form.control}
                  name="name"
                  label="Name"
                  placeHolder="e.g Address for home, work, etc."
                />

                <CustomFormField
                  control={form.control}
                  name="street"
                  label="Street"
                  placeHolder="Enter street address"
                  isRequired
                />

                <CustomFormField
                  control={form.control}
                  name="country"
                  label="Country"
                  type="select"
                  options={countryList.map((c) => ({
                    label: c.name,
                    value: c.code,
                  }))}
                  placeHolder="Enter country"
                  isRequired
                  className="w-full max-w-full"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomFormField
                    control={form.control}
                    name="state"
                    label="State"
                    placeHolder="Enter state"
                    isRequired
                  />
                  <CustomFormField
                    control={form.control}
                    name="city"
                    label="City"
                    placeHolder="Enter city"
                    isRequired
                  />
                </div>

                <CustomFormField
                  control={form.control}
                  name="zipCode"
                  label="Zip Code"
                  placeHolder="Enter zip code"
                  isRequired
                />

                <CustomFormField
                  control={form.control}
                  name="isDefault"
                  label="Default Address"
                  type="select"
                  options={[
                    { label: 'Set as Default', value: 'true' },
                    { label: 'Not default', value: 'false' },
                  ]}
                  placeHolder="Set as default address"
                  isRequired
                />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outlineGray"
                    size="lg"
                    className="w-auto"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full max-w-[200px]"
                    // onClick={handleSaveDraft}
                    isLoading={isLoading}
                  >
                    Create
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CustomModal>
      )}
    </div>
  );
};
