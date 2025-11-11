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
// If you have shadcn ScrollArea, uncomment next line and wrap the items.
// import { ScrollArea } from '@/components/ui/scroll-area';

type GroupedOption = {
  label: string;
  options: { id: string; name: string }[];
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
          .flatMap((g) => g.options)
          .find((it) => it.id === value);

        return (
          <div className="select-field w-full my-1">
            <Popover open={open} onOpenChange={setOpen}>
              {/* Make the button itself the trigger, with its own z-index. */}
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-haspopup="listbox"
                  onClick={() => setOpen((o) => !o)}
                  className={cn(
                    // clickable area + stacking context
                    'relative z-10 w-full h-12 !ring-0 !outline-none !border-0 justify-between text-left bg-secondary-bg text-primary-bg rounded-xl px-4 pointer-events-auto',
                    !selectedItem && 'text-muted-foreground'
                  )}
                >
                  <span className="truncate max-w-[300px]">
                    {selectedItem ? selectedItem.name : placeholder}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                </Button>
              </PopoverTrigger>

              {/* Match width to trigger; allow internal scrolling; prevent focus jumps */}
              <PopoverContent
                align="start"
                sideOffset={6}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                className={cn(
                  // width equals trigger width; high z; no padding
                  'w-[var(--radix-popover-trigger-width)] min-w-[14rem] max-w-[95vw] p-0 z-[1000] bg-white shadow-xl rounded-xl border'
                )}
              >
                <div className="text-xs bg-secondary-bg text-primary-bg p-2 font-semibold rounded-t-xl">
                  {label}
                </div>

                {/* Use either ScrollArea or a plain div with scroll enabled */}
                {/* <ScrollArea className="max-h-64"> */}
                <div
                  className="max-h-64 overflow-y-auto overscroll-contain px-1 py-1"
                  // keep wheel events inside the list so the page can still scroll when needed
                  onWheelCapture={(e) => e.stopPropagation()}
                  onTouchMoveCapture={(e) => e.stopPropagation()}
                >
                  {items.map((group) => (
                    <div key={group.label} className="mb-1">
                      <div className="text-[12px] font-semibold underline underline-offset-2 text-primary-bg pl-3 pt-2 pb-1">
                        {group.label}
                      </div>
                      {group.options.map((item) => {
                        const isSelected = value === item.id;
                        return (
                          <div
                            key={item.id}
                            role="option"
                            aria-selected={isSelected}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                onChange(item.id);
                                setOpen(false);
                              }
                            }}
                            onClick={() => {
                              onChange(item.id);
                              setOpen(false);
                            }}
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
                {/* </ScrollArea> */}
              </PopoverContent>
            </Popover>

            {error && <FormMessage>*{error.message}</FormMessage>}
          </div>
        );
      }}
    />
  );
};
