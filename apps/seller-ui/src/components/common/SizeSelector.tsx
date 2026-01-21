import { cn } from '@/lib/utils';
import { defaultSizes } from '@e-shop-app/packages/constants';
import { type FieldProps } from '@e-shop-app/packages/types';
import { type FieldValues, type Path } from 'react-hook-form';
import { FormControl } from '../ui/form';

export function SizeSelector<T extends FieldValues, E extends Path<T>>(
  props: FieldProps<T, E>,
) {
  const { field, className, classNames } = props;

  const fieldValue = (field.value || []) as string[];

  return (
    <FormControl>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {defaultSizes.map((size) => {
          const isSelected = fieldValue.includes(size);

          return (
            <button
              type="button"
              key={size}
              onClick={() =>
                field.onChange(
                  isSelected
                    ? fieldValue.filter((c: string) => c !== size)
                    : [...fieldValue, size],
                )
              }
              className={cn(
                `px-3 py-1 rounded-lg bg-transparent text-gray-300 flex items-center justify-center transition cursor-pointer border border-gray-600`,
                {
                  'bg-primary text-white border border-[#ffffff6b]': isSelected,
                },
                classNames?.item,
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </FormControl>
  );
}
