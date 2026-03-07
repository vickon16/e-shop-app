import { cn } from '@/lib/utils';
import { Control, useFieldArray } from 'react-hook-form';
import { FaPlusCircle } from 'react-icons/fa';
import { LuTrash } from 'react-icons/lu';
import { Button } from '../ui/button';
import { FormLabel } from '../ui/form';
import CustomFormField, { CommonProps } from './CustomFomField';

export function CustomSpecifications(
  props: CommonProps & {
    name: string;
    control: Control<any>;
    className?: string;
    disabled?: boolean;
  },
) {
  const { control, className, classNames, name, label, disabled } = props;
  const { fields, append, remove } = useFieldArray({
    control: props.control,
    name,
  });

  return (
    <div className={cn('flex flex-col gap-y-4', className)}>
      <FormLabel className={cn('text-sm tracking-wide', classNames?.label)}>
        {label}
      </FormLabel>

      <div className="md:ml-2 flex flex-col gap-3">
        {fields?.map((item, index) => {
          return (
            <div className="flex gap-2 items-center" key={index}>
              <CustomFormField
                control={control}
                name={`${name}.${index}.name`}
                label="Specification Name"
                placeHolder="e.g, Battery Life, Weight, Material"
                isRequired
                disabled={disabled}
              />
              <CustomFormField
                control={control}
                name={`${name}.${index}.value`}
                label="Specification Value"
                placeHolder="e.g, 4000mAh, 1.5Kg, Plastic"
                isRequired
                disabled={disabled}
              />
              <button
                type="button"
                className="text-red-500 hover:text-red-500"
                onClick={() => remove(index)}
              >
                <LuTrash size={20} />
              </button>
            </div>
          );
        })}

        <Button
          type="button"
          variant={'link'}
          className="w-fit text-blue-500"
          onClick={() =>
            append({
              name: '',
              value: '',
            })
          }
        >
          <FaPlusCircle size={20} /> Add Specifications
        </Button>
      </div>
    </div>
  );
}
