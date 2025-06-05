import React, { useEffect } from 'react';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import utcPlugin from 'dayjs/plugin/utc';
dayjs.extend(utcPlugin);

type DatePickerWithRangeProps = {
  className?: string;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
};

export function DatePickerWithRange({
  className,
  onDateRangeChange,
}: DatePickerWithRangeProps) {
  const today = new Date();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: today,
    to: today,
  });
  const [selectedYear, setSelectedYear] = React.useState<number>(
    new Date().getFullYear()
  );
  const [displayedMonth, setDisplayedMonth] = React.useState(today.getMonth());

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  }, []);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    console.log('event.target.value', event.target.value);
    setSelectedYear(year);

    // Adjust the calendar's default month when the year changes
    setDisplayedMonth(0);
    setDate((prev) => ({
      from: prev?.from
        ? new Date(year, prev.from.getMonth(), prev.from.getDate())
        : new Date(year, 0),
      to: prev?.to
        ? new Date(year, prev.to.getMonth(), prev.to.getDate())
        : undefined,
    }));
  };

  useEffect(() => {
    if (date?.from && date?.to) {
      const formattedStartDate = dayjs(date.from).startOf('day')
      // .utc()
      .format('YYYY-MM-DD HH:mm:ss');
      const formattedEndDate = dayjs(date.to).endOf('day')
      // .utc()
      .format('YYYY-MM-DD HH:mm:ss');

      if (onDateRangeChange) {
        onDateRangeChange(formattedStartDate, formattedEndDate);
      }
    }
  }, [date, onDateRangeChange]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            {/* Year Selector */}
            <div className="mb-4 flex items-center gap-4 justify-start">
              <label htmlFor="year" className="text-sm font-medium">
                Select Year
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={handleYearChange}
                className="rounded border px-2 py-1 text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {/* Calendar */}
            <Calendar
              initialFocus
              mode="range"
              selected={date}
              onSelect={(selectedRange) => {
                setDate(selectedRange);
              }}
              numberOfMonths={2}
              month={new Date(selectedYear, displayedMonth)}
              onMonthChange={(newMonth) => {
                setDisplayedMonth(newMonth.getMonth());
                setSelectedYear(newMonth.getFullYear());
              }}
              //   onSelect={setDate}
              //   defaultMonth={new Date(selectedYear, 0)}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
