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
};

export const SingleSelectDropDown = ({
  control,
  name,
  items,
  label,
  placeholder = 'Select an option',
  rules,
}: Props) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="select-field w-full my-1">
          <Select onValueChange={onChange} value={value}>
            <SelectTrigger className="w-full ring-0 focus:ring-0 focus:border-none">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="overflow-auto max-h-[250px] bg-mars-bg select-contents">
              <SelectGroup>
                <SelectLabel>{label}</SelectLabel>
                {items?.map((el) => (
                  <SelectItem key={el.id} value={el.id}>
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
// <div className="select-field w-full my-2">
//   <Select onValueChange={onChange} value={value}>
//     <SelectTrigger className="w-full ring-0 focus:ring-0 focus:border-none">
//       <SelectValue placeholder={placeHolder} />
//     </SelectTrigger>
//     <SelectContent className="overflow-auto max-h-[250px] bg-mars-bg select-contents">
//       <SelectGroup>
//         <SelectLabel>{label}</SelectLabel>
//         {items?.map((el: any, index: number) => {
//           return (
//             <SelectItem key={index} value={el.id}>
//               {el.name}
//             </SelectItem>
//           );
//         })}
//       </SelectGroup>
//     </SelectContent>
//   </Select>
// </div>
//   );
// };
