'use client';

import { useBaseMutation } from '@/actions/mutations/base.mutation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { errorToast } from '@/lib/utils';
import {
  addNewAdminSchema,
  TAddNewAdminSchema,
} from '@e-shop-app/packages/zod-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GET_ADMIN_USERS } from '@/actions/queries/user-queries';

export const AddAdminForm = () => {
  const queryClient = useQueryClient();

  const form = useForm<TAddNewAdminSchema>({
    resolver: zodResolver(addNewAdminSchema),
    defaultValues: {
      email: '',
      role: 'admin',
    },
  });

  const addAdminMutation = useBaseMutation<TAddNewAdminSchema, any>({
    endpoint: '/admin/add-new-admin',
  });

  const onSubmit = async (data: TAddNewAdminSchema) => {
    try {
      await addAdminMutation.mutateAsync(data);
      toast.success('Admin added successfully.');
      form.reset();
      queryClient.invalidateQueries({ queryKey: [GET_ADMIN_USERS, 'admin'] });
      queryClient.invalidateQueries({
        queryKey: [GET_ADMIN_USERS, 'super-admin'],
      });
    } catch (error) {
      errorToast(error, 'Failed to add admin.');
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 text-white">Add New Admin</h3>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col md:flex-row gap-4 items-start"
        >
          <div className="flex-1 w-full">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    User Email Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g: user@example.com"
                      className="w-full bg-gray-950/50 border-gray-800"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full md:w-64">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Assign Role <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-gray-950/50 border-gray-800">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="self-start md:mt-8 w-full md:w-auto">
            <Button
              type="submit"
              isLoading={addAdminMutation.isPending}
              className="w-full md:w-auto"
            >
              Add Admin
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
