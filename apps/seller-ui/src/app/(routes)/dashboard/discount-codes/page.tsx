'use client';

import { getDiscountCodes } from '@/actions/queries/product-queries';
import CustomModal from '@/components/common/CustomModal';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Routes } from '@/configs/routes';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { BiTrash } from 'react-icons/bi';
import { LuChevronRight, LuPlus } from 'react-icons/lu';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import CustomFormField from '@/components/common/CustomFomField';
import {
  createDiscountCodesSchema,
  TCreateDiscountCodesSchema,
} from '@e-shop-app/packages/zod-schemas';
import { toast } from 'sonner';
import { errorToast } from '@/lib/utils';
import { useDeleteDiscountCodeMutation } from '@/actions/mutations/product.mutation';
import { discountTypes } from '@e-shop-app/packages/constants';
import ConfirmActionModal from '@/components/common/ConfirmActionModal';
import { useBaseMutation } from '@/actions/mutations/base.mutation';

const tableHeadings = ['Title', 'Type', 'Value', 'Code', 'Actions'];

const DiscountCodesPage = () => {
  const [showModal, setShowModal] = useState(false);

  const form = useForm<TCreateDiscountCodesSchema>({
    resolver: zodResolver(createDiscountCodesSchema),
    defaultValues: {
      publicName: '',
      discountCode: '',
      discountType: 'percentage',
      discountValue: '',
    },
  });

  const discountCodeQuery = useQuery(getDiscountCodes());
  const discountCodes = discountCodeQuery.data || [];
  const [codeToDelete, setCodeToDelete] =
    useState<(typeof discountCodes)[number]>();

  const createDiscountMutation = useBaseMutation<
    TCreateDiscountCodesSchema,
    any
  >({
    endpoint: '/product/create-discount-codes',
    defaultMessage: 'Failed to create discount code',
  });

  const deleteDiscountMutation = useDeleteDiscountCodeMutation();

  const onSubmit = async (data: TCreateDiscountCodesSchema) => {
    console.log('Form Data:', data);
    // Implement create discount code functionality here

    if (discountCodeQuery.isLoading) return;

    if (discountCodes.length >= 10) {
      toast.error('Maximum of 10 discount codes allowed.');
      return;
    }

    try {
      const response = await createDiscountMutation.mutateAsync(data);
      if (response.success) {
        toast.success('Discount code created successfully!');
        setShowModal(false);
        form.reset();
        discountCodeQuery.refetch();
      }
    } catch (error) {
      errorToast(error, 'Failed to create discount code.');
    }
  };

  const handleDeleteCode = async (code: (typeof discountCodes)[number]) => {
    try {
      await deleteDiscountMutation.mutateAsync(code.id);
      toast.success('Discount code deleted successfully!');
      setCodeToDelete(undefined);
      discountCodeQuery.refetch();
    } catch (error) {
      console.log(error);
      errorToast(error, 'Failed to create discount code.');
    }
  };

  return (
    <>
      <div className="w-full min-h-screen p-8">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>

          <Button onClick={() => setShowModal(true)}>
            <LuPlus size={18} /> Create Discount
          </Button>
        </div>

        {/* BreadCrumbs */}
        <div className="flex items-center">
          <Link
            href={Routes.dashboard.base}
            className="text-[#80Deea] cursor-pointer"
          >
            Dashboard
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>Discount Codes</span>
        </div>

        {/* Content layout */}
        <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            Your Discount Codes
          </h3>

          {discountCodeQuery.isLoading ? (
            <p className="text-gray-400 text-center">Loading Discounts...</p>
          ) : (
            <Table className="dark">
              <TableHeader>
                <TableRow>
                  {tableHeadings.map((heading) => (
                    <TableHead key={heading}>{heading}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {discountCodes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={tableHeadings.length}
                      className="text-center py-6"
                    >
                      No discount codes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  discountCodes.map((discountCode) => (
                    <TableRow key={discountCode.id}>
                      <TableCell className="font-medium">
                        {discountCode.publicName}
                      </TableCell>
                      <TableCell>
                        {discountCode.discountType === 'percentage'
                          ? 'Percentage (%)'
                          : 'Flat ($)'}
                      </TableCell>
                      <TableCell>
                        {discountCode.discountType === 'percentage'
                          ? `${discountCode.discountValue}%`
                          : `$${discountCode.discountValue}`}
                      </TableCell>
                      <TableCell>{discountCode.discountCode}</TableCell>
                      <TableCell>
                        <Button
                          variant={'ghost'}
                          className="text-red-400 hover:text-red-300"
                          onClick={() => setCodeToDelete(discountCode)}
                        >
                          <BiTrash size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {showModal && (
        <CustomModal
          open={showModal}
          onOpenChange={() => setShowModal(false)}
          classNames={{
            content: 'dark p-6 space-y-6',
          }}
        >
          <h3 className="text-xl">Create Discount Code</h3>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 dark"
            >
              <CustomFormField
                control={form.control}
                name="publicName"
                label="Title (Public Name)"
                placeHolder="e.g Summer Sale"
                isRequired
              />

              <CustomFormField
                control={form.control}
                name="discountType"
                label="Discount Type"
                type="select"
                options={discountTypes.map((type) => ({
                  label:
                    type === 'percentage'
                      ? 'Percentage (%)'
                      : 'Flat Amount ($)',
                  value: type,
                }))}
                className="max-w-full"
                isRequired
              />

              <CustomFormField
                control={form.control}
                name="discountValue"
                type="number"
                label="Discount Value"
                placeHolder="e.g 20"
                isRequired
              />

              <CustomFormField
                control={form.control}
                name="discountCode"
                label="Discount Code"
                placeHolder="e.g SAVE20"
                isRequired
              />

              <Button
                type="submit"
                size="lg"
                className="w-full mt-4!"
                isLoading={createDiscountMutation.isPending}
              >
                Create Discount Code
              </Button>
            </form>
          </Form>
        </CustomModal>
      )}

      {!!codeToDelete && (
        <ConfirmActionModal
          heading={`Are you absolutely sure you want to delete this discount code '${codeToDelete.discountCode}'?`}
          description="This action cannot be undone. This will permanently delete the discount code from our servers."
          open={!!codeToDelete}
          confirmActionLabel={'Delete Discount Code'}
          onOpenChange={() => {
            setCodeToDelete(undefined);
          }}
          confirmAction={() => handleDeleteCode(codeToDelete)}
          confirmActionVariant="destructive"
          isLoadingConfirmAction={deleteDiscountMutation.isPending}
          className="dark"
        />
      )}
    </>
  );
};

export default DiscountCodesPage;
