import { cn } from '@/lib/utils';
import { Control, useFieldArray } from 'react-hook-form';
import { FaPlusCircle } from 'react-icons/fa';
import { LuTrash, LuX } from 'react-icons/lu';
import { Button } from '../ui/button';
import { FormField, FormLabel } from '../ui/form';
import CustomFormField, {
  BaseFormControls,
  CommonProps,
} from './CustomFomField';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';

export function CustomProperties(
  props: CommonProps & {
    name: string;
    control: Control<any>;
    className?: string;
    disabled?: boolean;
  },
) {
  const { control, className, classNames, name, label, disabled, placeHolder } =
    props;
  const [properties, setProperties] = useState<
    { label: string; value: string; values: string[] }[]
  >([]);
  const [newLabel, setNewLabel] = useState('');

  return (
    <div className="flex gap-2 items-center w-full">
      <FormField
        control={control}
        name={name}
        disabled={disabled}
        render={({ field }) => {
          useEffect(() => {
            field.onChange(properties);
          }, [properties]);

          const addProperty = () => {
            if (!newLabel.trim()) return;
            setProperties([
              ...properties,
              { label: newLabel, value: '', values: [] },
            ]);
            setNewLabel('');
          };

          const addValue = (index: number) => {
            const updatedProperties = [...properties];
            const newValue = updatedProperties[index].value;

            if (!newValue.trim()) return;

            updatedProperties[index].values.push(newValue);
            updatedProperties[index].value = '';
            setProperties(updatedProperties);
          };

          const removeProperty = (index: number) => {
            setProperties(properties.filter((_, i) => i !== index));
          };

          return (
            <div className={'w-full'}>
              <FormLabel
                className={cn('text-sm tracking-wide', classNames?.label)}
              >
                {label}
              </FormLabel>

              <div className="flex flex-col gap-3 w-full">
                {properties.map((property, index) => (
                  <div
                    key={index}
                    className="border border-gray-700 p-3 space-y-2 rounded-lg bg-gray-800"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">
                        {property.label}
                      </span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeProperty(index)}
                      >
                        <LuX size={18} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={property.value}
                        onChange={(e) =>
                          setProperties((prev) =>
                            prev.map((p) =>
                              p.label === property.label
                                ? { ...p, value: e.target.value }
                                : p,
                            ),
                          )
                        }
                        placeholder="Enter value"
                      />
                      <button
                        type="button"
                        onClick={() => addValue(index)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md"
                      >
                        Add
                      </button>
                    </div>

                    {/* Show all the values */}
                    <div className="flex flex-wrap gap-2">
                      {property.values.map((value, valIndex) => (
                        <span
                          key={valIndex}
                          className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Add new properties */}
                <div className="flex items-center gap-2 mt-1 w-full">
                  <Input
                    value={newLabel}
                    placeholder="Enter property label (e.g, Material, Warranty)"
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full"
                  />
                  <Button type="button" className="w-fit" onClick={addProperty}>
                    <FaPlusCircle size={16} /> Add
                  </Button>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
