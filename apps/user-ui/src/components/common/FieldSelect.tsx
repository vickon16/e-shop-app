import { type FieldProps, type TSelect } from '@e-shop-app/packages/types';
import { type FieldValues, type Path } from 'react-hook-form';
import CustomSelect from '@/components/common/CustomSelect';

export function FieldSelect<T extends FieldValues, E extends Path<T>>(
  props: FieldProps<T, E> & {
    options: Array<TSelect>;
  },
) {
  const { field } = props;

  return (
    <CustomSelect
      onValueChange={field.onChange}
      defaultValue={field.value}
      withControl
      {...props}
    />
  );
}

export default FieldSelect;
