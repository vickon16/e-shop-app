import { cn } from '@/lib/utils';
import { type FieldProps } from '@e-shop-app/packages/types';
import { type FieldValues, type Path } from 'react-hook-form';
import { FormControl } from '../ui/form';
import { getDiscountCodes } from '@/actions/queries/product-queries';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../ui/skeleton';

export function DiscountCodesSelector<T extends FieldValues, E extends Path<T>>(
  props: FieldProps<T, E>,
) {
  const { field, className, classNames } = props;

  const discountCodeQuery = useQuery(getDiscountCodes());
  const discountCodes = discountCodeQuery.data || [];

  const fieldValue = (field.value || []) as string[];

  return (
    <FormControl>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {discountCodeQuery?.isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="w-20 h-8 bg-gray-700 rounded-lg" />
          ))
        ) : discountCodeQuery?.isError ? (
          <p className="text-red-500">Failed to load discount codes.</p>
        ) : discountCodes.length === 0 ? (
          <p className="text-gray-500">No discount codes available.</p>
        ) : (
          discountCodes.map((code) => {
            const isSelected = fieldValue.includes(code.id);

            return (
              <button
                type="button"
                key={code.id}
                onClick={() =>
                  field.onChange(
                    isSelected
                      ? fieldValue.filter((c: string) => c !== code.id)
                      : [...fieldValue, code.id],
                  )
                }
                className={cn(
                  `px-3 py-1 rounded-lg bg-transparent text-gray-300 flex items-center justify-center transition cursor-pointer border border-gray-600`,
                  {
                    'bg-primary text-white border border-[#ffffff6b]':
                      isSelected,
                  },
                  classNames?.item,
                )}
              >
                {code.discountCode}
              </button>
            );
          })
        )}
      </div>
    </FormControl>
  );
}
