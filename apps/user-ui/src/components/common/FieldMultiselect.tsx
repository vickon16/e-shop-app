import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, normalizeAndCapitalize } from '@/lib/utils';
import { type FieldProps, type TSelect } from '@e-shop-app/packages/types';
import { useMemo, useState } from 'react';
import { type FieldValues, type Path } from 'react-hook-form';
import { LuX } from 'react-icons/lu';
import { IoBanOutline } from 'react-icons/io5';

export function FieldMultiSelect<T extends FieldValues, E extends Path<T>>(
  props: FieldProps<T, E> & {
    options: Array<TSelect>;
    tryAgain?: () => void;
    classNames?: {
      commandWrapperDiv?: string;
      dropDownClass?: string;
    };
    errorComponent?: {
      isFullWidth?: boolean;
      errorPlaceholder?: string;
    };
    noOptionsComponent?: React.ReactNode;
  },
) {
  const {
    field,
    className,
    shouldNormalize,
    placeHolder,
    options,
    isLoading,
    isError,
    classNames,
    noOptionsComponent,
  } = props;

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const selected: string[] = useMemo(() => field.value ?? [], [field.value]);

  const handleUnselect = (option: string) => {
    const updated = selected.filter((value) => value !== option);
    field.onChange(updated);
  };

  const handleSelect = (option: string) => {
    const updated = [...selected, option];
    field.onChange(updated);
    setInputValue('');
  };

  // const handleKeyDown = useCallback(
  //   (e: React.KeyboardEvent<HTMLInputElement>) => {
  //     if (e.key === "Backspace" && selected.length > 0) {
  //       const updated = selected.slice(0, -1);
  //       field.onChange(updated);
  //     }
  //   },
  //   [selected, field]
  // );

  const filteredSelected = useMemo(
    () => options.filter((option) => !selected.includes(option.value)),
    [selected, options],
  );

  return isLoading ? (
    <Skeleton className="h-14 w-full" />
  ) : isError ? (
    <div className="w-full flex items-center justify-center">
      <p className="text-red-500">Failed to fetch data</p>
    </div>
  ) : options.length === 0 ? (
    <>
      {noOptionsComponent ? (
        <>{noOptionsComponent}</>
      ) : (
        <div className="h-14 w-full flex gap-1.5 items-center justify-center text-muted-foreground border border-dashed text-sm">
          <IoBanOutline className="size-3" />
          No options available
        </div>
      )}
    </>
  ) : (
    <Command className="overflow-visible bg-transparent">
      <div
        className={cn(
          'rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-full flex flex-wrap gap-1',
          classNames?.commandWrapperDiv,
        )}
      >
        {selected.map((option) => {
          const optionLabel = options.find(
            (opt) => opt.value === option,
          )?.label;
          return (
            <Badge key={option} variant="secondary" className="select-none">
              {shouldNormalize
                ? normalizeAndCapitalize(optionLabel ?? option)
                : (optionLabel ?? option)}
              <LuX
                className="size-3 text-muted-foreground hover:text-foreground ml-2 cursor-pointer"
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => {
                  handleUnselect(option);
                }}
              />
            </Badge>
          );
        })}

        <CommandInput
          // onKeyDown={handleKeyDown}
          value={inputValue}
          onValueChange={setInputValue}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          placeholder={placeHolder ?? 'Select multiple options...'}
          className={cn(
            'flex-1 bg-transparent border border-gray-800 px-3 outline-none placeholder:text-muted-foreground w-full',
            className,
          )}
          wrapperClassName="border-none w-full border-0 border-transparent"
        />
      </div>

      <div className="relative">
        <CommandList>
          {open && !!filteredSelected.length && (
            <div
              className={cn(
                'absolute top-1 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none max-w-[300px] max-h-[300px] overflow-auto p-1',
                classNames?.dropDownClass,
              )}
            >
              <CommandGroup className="h-full overflow-auto p-2.5">
                {filteredSelected.map((option) => {
                  return (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onSelect={() => {
                        handleSelect(option.value);
                      }}
                      className={'cursor-pointer flex-col items-start gap-1'}
                      disabled={option.disabled}
                    >
                      <p className="font-medium">
                        {shouldNormalize
                          ? normalizeAndCapitalize(option.label)
                          : option.label}
                      </p>

                      {option?.description && (
                        <p className="text-muted-foreground text-xs">
                          {option.description}
                        </p>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          )}
        </CommandList>
      </div>
    </Command>
  );
}

export default FieldMultiSelect;
