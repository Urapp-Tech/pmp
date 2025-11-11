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

export const MultiSelectGroupedDropDown: React.FC<Props> = ({
  control,
  name,
  items,
  label,
  placeholder = 'Select options',
  rules,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedIds: string[] = Array.isArray(value) ? value : [];

        const toggleSelect = (id: string) => {
          const updated = selectedIds.includes(id)
            ? selectedIds.filter((v) => v !== id)
            : [...selectedIds, id];
          onChange(updated);
        };

        const selectedNames = items
          .flatMap((g) => g.options)
          .filter((o) => selectedIds.includes(o.id))
          .map((o) => o.name)
          .join(', ');

        return (
          <div className="select-field w-full my-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-haspopup="listbox"
                  onClick={() => setOpen((o) => !o)}
                  className={cn(
                    'relative z-10 w-full h-12 !ring-0 !outline-none !border-0 justify-between text-left bg-secondary-bg text-primary-bg rounded-xl px-4 pointer-events-auto',
                    !selectedIds.length && 'text-muted-foreground'
                  )}
                >
                  <span className="truncate max-w-[300px]">
                    {selectedIds.length ? selectedNames : placeholder}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                sideOffset={6}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                className={cn(
                  'w-[var(--radix-popover-trigger-width)] min-w-[14rem] max-w-[95vw] p-0 z-[1000] bg-white shadow-xl rounded-xl border'
                )}
              >
                {/* header bar — same as single select */}
                <div className="text-xs bg-secondary-bg text-primary-bg p-2 font-semibold rounded-t-xl">
                  {label}
                </div>

                {/* scroll area for items */}
                <div
                  className="max-h-64 overflow-y-auto overscroll-contain px-1 py-1"
                  onWheelCapture={(e) => e.stopPropagation()}
                  onTouchMoveCapture={(e) => e.stopPropagation()}
                >
                  {items.map((group) => (
                    <div key={group.label} className="mb-1">
                      <div className="text-[12px] font-semibold underline underline-offset-2 text-primary-bg pl-3 pt-2 pb-1">
                        {group.label}
                      </div>

                      {group.options.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            role="option"
                            aria-selected={isSelected}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                toggleSelect(item.id);
                              }
                            }}
                            onClick={() => toggleSelect(item.id)}
                            className={cn(
                              'px-3 py-2 my-1 text-sm cursor-pointer rounded-md',
                              isSelected
                                ? 'bg-secondary-bg font-semibold text-primary-bg'
                                : 'hover:bg-muted text-primary-bg'
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
