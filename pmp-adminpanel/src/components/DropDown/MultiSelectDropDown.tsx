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

type Option = { id: string; name: string };

type Props = {
  control: any;
  name: string;
  items: Option[];
  label: string;
  placeholder?: string;
  rules?: object;
};

export const MultiSelectDropDown = ({
  control,
  name,
  items,
  label,
  placeholder = 'Select options',
  rules,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedIds: string[] = value || [];

        const toggleSelect = (id: string) => {
          const updated = selectedIds.includes(id)
            ? selectedIds.filter((val) => val !== id)
            : [...selectedIds, id];
          onChange(updated);
        };

        const selectedNames = items
          .filter((item) => selectedIds.includes(item.id))
          .map((item) => item.name)
          .join(', ');

        return (
          <div className="select-field w-full my-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between ring-0 focus:ring-0 focus:border-none text-left',
                    !selectedIds.length && 'text-muted-foreground'
                  )}
                >
                  <span className="truncate max-w-[300px]">
                    {selectedIds.length ? selectedNames : placeholder}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="min-w-[100%] w-[300px] p-0 bg-mars-bg z-[999]"
                align="start"
                sideOffset={4}
              >
                <div className="text-xs bg-mars-bg px-2 pt-2 underline underline-offset-2 font-semibold">
                  {label}
                </div>
                <div className="px-1 max-h-[250px] overflow-auto">
                  {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelect(item.id)}
                        className={cn(
                          'px-3 py-2 my-1 text-sm cursor-pointer rounded-md',
                          isSelected ? 'bg-muted' : 'hover:bg-muted'
                        )}
                      >
                        {item.name}
                      </div>
                    );
                  })}
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
