'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useBaseMutation } from '@/actions/mutations/base.mutation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn, errorToast } from '@/lib/utils';
import { shopCategories } from '@e-shop-app/packages/constants';
import { TSeller } from '@e-shop-app/packages/types';
import {
  createShopSchema,
  TCreateShopSchema,
} from '@e-shop-app/packages/zod-schemas';
import { useTransition } from 'react';

type Props = {
  sellerId: string;
  onShopCreated: (data: TSeller) => void;
};

const CreateShop = (props: Props) => {
  const { sellerId, onShopCreated } = props;
  const [isPending, startTransition] = useTransition();

  const form = useForm<TCreateShopSchema>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: '',
      category: '',
      address: '',
      bio: '',
      website: '',
      openingHours: '',
      sellerId,
    },
  });

  const createShopMutation = useBaseMutation<TCreateShopSchema, any>({
    endpoint: '/auth/create-shop',
  });

  async function onSubmit(data: TCreateShopSchema) {
    startTransition(async () => {
      try {
        const response = await createShopMutation.mutateAsync(data);

        if (response.success && response.data) {
          onShopCreated(response.data);
        }
      } catch (error) {
        errorToast(error, 'Failed to Sign up. Please try again');
      }
    });
  }

  const isLoading = isPending || createShopMutation.isPending;

  return (
    <>
      <h3 className="text-2xl font-semibold text-primary text-center mb-2">
        Setup Your Shop
      </h3>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          {/* Shop Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Shop Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g: John Doe"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shop Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g: 123 Main St, City, Country"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shop category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Shop Category <span className="text-red-500">*</span>
                </FormLabel>

                <Select {...field} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className={cn('w-full')}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="max-h-70">
                    {shopCategories.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Email */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Bio</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Write a short bio about your shop"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shop Opening hours */}
          <FormField
            control={form.control}
            name="openingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Opening Hours
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g: Mon-Fri 9am - 5pm"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g: https://www.yourshop.com"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full my-8!"
          >
            Create a Shop
          </Button>
        </form>
      </Form>
    </>
  );
};

export default CreateShop;
