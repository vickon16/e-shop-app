import React, { useState } from 'react';
import { type FieldProps, type TSelect } from '@e-shop-app/packages/types';
import { type FieldValues, type Path } from 'react-hook-form';
import CustomSelect from '@/components/common/CustomSelect';
import { FormControl } from '../ui/form';
import { cn } from '@/lib/utils';
import { LuPlus } from 'react-icons/lu';
import { Button } from '../ui/button';
import { baseColor, defaultColors } from '@e-shop-app/packages/constants';

export function ColorSelector<T extends FieldValues, E extends Path<T>>(
  props: FieldProps<T, E>,
) {
  const { field, className, classNames, shouldNormalize, placeHolder } = props;
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState(baseColor);

  const fieldValue = (field.value || []) as string[];

  const colors = Array.from(new Set([...defaultColors, ...customColors]));

  return (
    <FormControl>
      <>
        <div className={cn('flex flex-wrap gap-2', className)}>
          {colors.map((color) => {
            const isSelected = fieldValue.includes(color);
            const isLightColor = ['#ffffff', '#ffff00', '#00ffff'].includes(
              color,
            );

            return (
              <button
                type="button"
                key={color}
                className={cn(
                  `size-7 p-2 rounded-md flex items-center justify-center border-transparent transition cursor-pointer border-2`,
                  {
                    'scale-110 border-white': isSelected,
                    'border-gray-600': isLightColor,
                  },
                  classNames?.item,
                )}
                style={{ backgroundColor: color }}
                onClick={() =>
                  field.onChange(
                    isSelected
                      ? fieldValue.filter((c: string) => c !== color)
                      : [...fieldValue, color],
                  )
                }
              />
            );
          })}

          {/* Add new color */}
          <button
            type="button"
            className="size-8 flex items-center justify-center rounded-full border-2 border-gray-500 bg-gray-800 hover:bg-gray-700 transition"
            onClick={() => setShowColorPicker((prev) => !prev)}
          >
            <LuPlus size={16} className="text-white" />
          </button>
        </div>

        {/* Color picker */}
        {showColorPicker && (
          <div className="relative flex items-center gap-2">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-full max-w-[100px] h-10 p-0 border-none cursor-pointer"
            />

            <Button
              type="button"
              onClick={() => {
                setCustomColors([...customColors, newColor]);
                setShowColorPicker(false);
              }}
            >
              Add
            </Button>
          </div>
        )}
      </>
    </FormControl>
  );
}
