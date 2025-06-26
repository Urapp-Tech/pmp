import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Controller } from 'react-hook-form';
import { ChevronsUpDown } from 'lucide-react';
import { FormMessage } from '../ui/form';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type GroupedOption = {
  label: string; // building name
  options: { id: string; name: string }[]; // units
};

type Props = {
  control: any;
  name: string;
  items: GroupedOption[];
  label: string;
  placeholder?: string;
  rules?: object;
};

export const SingleSelectGroupDropdown: React.FC<Props> = ({
  control,
  name,
  items,
  label,
  placeholder = 'Select option',
  rules,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedItem = items
          .flatMap((group) => group.options)
          .find((item) => item.id === value);

        return (
          <div className="select-field w-full my-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between ring-0 focus:ring-0 focus:border-none text-left',
                    !selectedItem && 'text-muted-foreground'
                  )}
                >
                  <span className="truncate max-w-[300px]">
                    {selectedItem ? selectedItem.name : placeholder}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="min-w-[100%] w-[300px] p-0 bg-mars-bg z-[999]"
                align="start"
                sideOffset={4}
              >
                <div className="text-xs bg-lunar-bg text-white p-2 font-semibold">
                  {label}
                </div>
                <div className="px-1 max-h-[250px] overflow-auto">
                  {items.map((group) => (
                    <div key={group.label} className="mb-1">
                      <div className="text-[12px] font-semibold underline underline-offset-2 text-muted-foreground pl-3 pt-2 pb-1">
                        {group.label}
                      </div>
                      {group.options.map((item) => {
                        const isSelected = value === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              onChange(item.id);
                              setOpen(false); // close on selection
                            }}
                            className={cn(
                              'px-3 py-2 my-1 text-sm cursor-pointer rounded-md',
                              isSelected
                                ? 'bg-muted font-semibold'
                                : 'hover:bg-muted'
                            )}
                          >
                            {item.name}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {error && <FormMessage>*{error.message}</FormMessage>}
          </div>
        );
      }}
    />
  );
};
