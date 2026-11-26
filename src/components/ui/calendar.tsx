'use client';

import * as React from 'react';
import {
  IconChevronDown as ChevronDown,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
} from '@tabler/icons-react';
import { DayButton, DayPicker, type DayButtonProps } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const navButton = cn(
  buttonVariants({ variant: 'outline' }),
  'h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 rounded-full'
);

const dayState = {
  selected:
    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full',
  today: 'border-2 border-primary text-accent-foreground rounded-full',
  outside: 'text-muted-foreground opacity-50 rounded-full',
  disabled: 'text-muted-foreground opacity-40 rounded-full',
  range_middle:
    'data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
};

function CalendarDayButton({ className, modifiers, ...props }: DayButtonProps) {
  return (
    <DayButton
      modifiers={modifiers}
      data-selected={modifiers.selected || undefined}
      className={cn(
        className,
        modifiers.today && dayState.today,
        modifiers.outside && dayState.outside,
        modifiers.disabled && dayState.disabled,
        modifiers.selected && dayState.selected,
        modifiers.range_middle && dayState.range_middle
      )}
      {...props}
    />
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'dropdown',
  ...props
}: CalendarProps) {
  const isDropdown = captionLayout !== 'label';

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-3',
        month_caption: 'relative flex justify-center items-center h-8 px-8',
        caption_label: cn(
          'text-xs font-semibold text-foreground inline-flex items-center gap-1',
          isDropdown &&
            'rounded-lg border border-border bg-card px-2 py-1 shadow-2xs pointer-events-none'
        ),
        dropdowns: 'flex items-center justify-center gap-1.5',
        dropdown_root:
          'relative inline-flex items-center rounded-lg focus-within:ring-2 focus-within:ring-ring',
        dropdown:
          'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
        nav: 'absolute left-0 top-0.5 w-full flex items-center justify-between pointer-events-none z-10',
        button_previous: cn(navButton, 'pointer-events-auto'),
        button_next: cn(navButton, 'pointer-events-auto'),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday:
          'text-muted-foreground rounded-full w-9 font-medium text-[0.75rem]',
        week: 'flex w-full mt-1.5',
        day: 'h-9 w-9 text-center text-sm p-0 relative [&:has([data-selected=true])]:bg-accent first:[&:has([data-selected=true])]:rounded-l-full last:[&:has([data-selected=true])]:rounded-r-full focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal data-[selected=true]:opacity-100 rounded-full tabular-nums'
        ),
        hidden: 'invisible rounded-full',
        ...classNames,
      }}
      components={{
        Chevron: (chevronProps) => {
          if (chevronProps.orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" />;
          }
          if (chevronProps.orientation === 'right') {
            return <ChevronRight className="h-4 w-4" />;
          }
          return <ChevronDown className="h-3 w-3 text-muted-foreground" />;
        },
        DayButton: CalendarDayButton,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
