'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar-raw';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  type Control,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { FaCalendar } from 'react-icons/fa';
import FieldSelect from './FieldSelect';
import { type TSelect } from '@e-shop-app/packages/types';
import { Textarea } from '@/components/ui/textarea';
import { ColorSelector } from '@/components/common/ColorSelector';
import { RichTextEditor } from './RichTextEditor';
import FieldMultiSelect from './FieldMultiselect';
import { SizeSelector } from './SizeSelector';

export type CommonProps = {
  label: string;
  placeHolder?: string;
  className?: string;
  classNames?: {
    content?: string;
    label?: string;
    item?: string;
    multiSelect?: string;
    trigger?: string;
  };
  isRequired?: boolean;
};

type DefaultInputProps = CommonProps & {
  type?:
    | 'default'
    | 'email'
    | 'number'
    | 'date'
    | 'phone'
    | 'text-area'
    | 'color-selector'
    | 'rich-text-editor'
    | 'size-selector'
    | 'discount-code-selector';
};

type SelectInputProps = CommonProps & {
  type: 'select';
  options: TSelect[];
  shouldNormalize?: boolean;
};

type MultiSelectInputProps = CommonProps & {
  type: 'multi-select';
  options: TSelect[];
  shouldNormalize?: boolean;
};

type BaseFormFieldProps =
  | DefaultInputProps
  | SelectInputProps
  | MultiSelectInputProps;

type CustomFormFieldProps<T extends FieldValues> = BaseFormFieldProps & {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
};

export const CustomFormField = <T extends FieldValues>(
  props: CustomFormFieldProps<T>,
) => {
  const { control, name, disabled, ...baseProps } = props;

  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field }) => <BaseFormControls {...baseProps} field={field} />}
    />
  );
};

export default CustomFormField;

export const BaseFormItem = ({
  label,
  isRequired,
  children,
  classNames,
}: Pick<BaseFormFieldProps, 'label' | 'isRequired' | 'classNames'> & {
  children: React.ReactNode;
}) => (
  <FormItem className="flex flex-col gap-y-0.5">
    <FormLabel className={cn('text-sm tracking-wide', classNames?.label)}>
      {label} {isRequired && <span className="text-red-500">*</span>}
    </FormLabel>
    {children}
    <FormMessage className="text-xs" />
  </FormItem>
);

export const BaseFormControls = <T extends FieldValues, E extends Path<T>>(
  props: BaseFormFieldProps & {
    field: ControllerRenderProps<T, E>;
  },
) => {
  const { label, isRequired, classNames } = props;
  const { field } = props;

  return (
    <BaseFormItem label={label} isRequired={isRequired} classNames={classNames}>
      {!props.type && (
        <FormControl>
          <Input
            {...field}
            type={'text'}
            className={props.className}
            placeholder={props.placeHolder}
          />
        </FormControl>
      )}

      {(props.type === 'email' ||
        props.type === 'number' ||
        props.type === 'phone') && (
        <FormControl>
          <Input
            {...field}
            type={props.type}
            className={props.className}
            placeholder={props.placeHolder}
          />
        </FormControl>
      )}

      {props.type === 'text-area' && (
        <FormControl>
          <Textarea
            {...field}
            className={props.className}
            placeholder={props.placeHolder}
          />
        </FormControl>
      )}

      {props.type === 'date' && (
        <Popover modal={false}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant="outline"
                className={cn(
                  'flex w-full text-left h-10 font-normal border-input',
                  !field.value && 'text-muted-foreground',
                  props.className,
                )}
              >
                {field.value ? (
                  format(field.value, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
                <FaCalendar className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={field.value ?? new Date()}
              onSelect={field.onChange}
              disabled={{
                after: new Date(),
                before: new Date(1900, 0),
              }}
            />
          </PopoverContent>
        </Popover>
      )}

      {props.type === 'select' && (
        <FieldSelect
          field={field}
          className={props.className}
          placeHolder={props.placeHolder}
          classNames={props.classNames}
          options={props.options}
          shouldNormalize={props.shouldNormalize}
        />
      )}

      {props.type === 'color-selector' && (
        <ColorSelector
          field={field}
          className={props.className}
          placeHolder={props.placeHolder}
          classNames={{ item: props.classNames?.item }}
        />
      )}

      {props.type === 'size-selector' && (
        <SizeSelector
          field={field}
          className={props.className}
          classNames={{ item: props.classNames?.item }}
        />
      )}

      {props.type === 'rich-text-editor' && (
        <RichTextEditor
          value={field.value}
          onChange={field.onChange}
          placeholder={props.placeHolder}
          className={props.className}
          classNames={{ content: props.classNames?.content }}
        />
      )}

      {props.type === 'multi-select' && (
        <FieldMultiSelect
          field={field}
          className={props.className}
          placeHolder={props.placeHolder}
          options={props.options}
          shouldNormalize={props.shouldNormalize}
          classNames={props.classNames}
        />
      )}
    </BaseFormItem>
  );
};
