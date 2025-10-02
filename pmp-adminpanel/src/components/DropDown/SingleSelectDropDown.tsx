import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Controller } from 'react-hook-form';
import { FormMessage } from '../ui/form';

type Props = {
  control: any;
  name: string;
  items: Array<{ id: string; name: string }>;
  label: string;
  placeholder?: string;
  rules?: object;
  className?: string;
  mainClassName?: string;
};

export const SingleSelectDropDown = ({
  control,
  name,
  items,
  label,
  placeholder = 'Choose an option',
  rules,
  className = '',
  mainClassName,
}: Props) => {
  const triggerBase =
    'h-10 w-full rounded bg-bodyTable text-sm text-primary-bg ' + // <-- added space at end
    'data-[placeholder]:text-primary-bg ' +
    'border-0 outline-none ring-0 focus:outline-none focus:ring-0';

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className={`${mainClassName ?? 'select-field'} w-full my-1`}>
          <Select onValueChange={onChange} value={value ?? undefined}>
            <SelectTrigger className={`${triggerBase} ${className}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent
              className="max-h-[260px] overflow-auto rounded border-0 shadow-md
                         bg-white text-primary-bg"
            >
              <SelectGroup>
                {label ? (
                  <SelectLabel className="px-3 py-2 text-xs text-primary-bg/60">
                    {label}
                  </SelectLabel>
                ) : null}

                {items?.map((el) => (
                  <SelectItem
                    key={el.id}
                    value={el.id}
                    className="cursor-pointer text-sm text-primary-bg
                               focus:bg-primary-bg/10 focus:text-primary-bg
                               data-[state=checked]:bg-primary-bg/10"
                  >
                    {el.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {error && <FormMessage>*{error.message}</FormMessage>}
        </div>
      )}
    />
  );
};
