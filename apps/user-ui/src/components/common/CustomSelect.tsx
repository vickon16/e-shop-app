import { FormControl } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { normalizeAndCapitalize } from '@/lib/utils';
import { type TBaseFieldProps, type TSelect } from '@e-shop-app/packages/types';
import { cn } from '@/lib/utils';

export function CustomSelect(
  props: TBaseFieldProps & {
    onValueChange: (value: string) => void;
    defaultValue?: string;
    options: Array<TSelect>;
    withControl?: boolean;
  },
) {
  const {
    onValueChange,
    defaultValue,
    className,
    classNames,
    shouldNormalize,
    placeHolder,
    options,
    withControl,
  } = props;

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      {withControl ? (
        <>
          <FormControl>
            <SelectTrigger className={cn('max-w-[300px]', className)}>
              <SelectValue placeholder={placeHolder ?? 'Select an option'} />
            </SelectTrigger>
          </FormControl>
        </>
      ) : (
        <SelectTrigger className={cn('max-w-[300px]', className)}>
          <SelectValue placeholder={placeHolder ?? 'Select an option'} />
        </SelectTrigger>
      )}
      <SelectContent className={cn('max-h-[300px]', classNames?.content)}>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={cn(classNames?.item)}
          >
            {shouldNormalize
              ? normalizeAndCapitalize(option.label)
              : option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CustomSelect;
