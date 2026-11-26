'use client';

import * as React from 'react';
import {
  IconCalendar as CalendarIcon,
  IconCheck as Check,
  IconChevronDown as ChevronDown,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconX as X,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2024, index, 1))
);

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, offset: number) =>
  new Date(date.getFullYear(), date.getMonth() + offset, 1);

const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

interface PickerMenuProps {
  label: string;
  ariaLabel: string;
  items: { value: number; label: string }[];
  selectedValue: number;
  onSelect: (value: number) => void;
  align?: 'start' | 'end';
  width?: string;
}

function PickerMenu({
  label,
  ariaLabel,
  items,
  selectedValue,
  onSelect,
  align = 'start',
  width = 'w-28',
}: PickerMenuProps) {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    event.preventDefault();
    const nodes = Array.from(
      wrapperRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []
    );
    const currentIndex = nodes.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex =
      event.key === 'ArrowDown'
        ? Math.min(nodes.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);
    nodes[nextIndex]?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-6 items-center gap-1 rounded-lg border border-border bg-card px-2 text-[11px] font-semibold text-foreground shadow-2xs transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="tabular-nums">{label}</span>
        <ChevronDown
          className={cn(
            'size-3 text-muted-foreground transition-transform duration-150',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          onKeyDown={handleListKeyDown}
          className={cn(
            'absolute z-20 top-full mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg',
            width,
            align === 'end' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => {
            const isSelected = item.value === selectedValue;
            const hasSelection = items.some((entry) => entry.value === selectedValue);
            return (
              <button
                key={item.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                autoFocus={isSelected || (!hasSelection && index === 0)}
                onClick={() => {
                  onSelect(item.value);
                  close();
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] tabular-nums transition-colors',
                  isSelected
                    ? 'bg-accent font-semibold text-primary'
                    : 'text-foreground hover:bg-muted/70'
                )}
              >
                <span>{item.label}</span>
                {isSelected && <Check className="size-3 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface PillowDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  /**
   * Fires whenever the visible month changes while browsing (arrows or the
   * month and year menus) without selecting a date. Lets the caller move the
   * heatmap year independently from the date filter.
   */
  onMonthChange?: (month: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Years offered in the year menu, newest first. Defaults to the last 6 years. */
  years?: number[];
  maxDate?: Date;
  align?: 'start' | 'center' | 'end';
  className?: string;
  ariaLabel?: string;
}

function DatePicker({
  value,
  onChange,
  onMonthChange,
  placeholder = 'Pick date',
  disabled,
  years,
  maxDate,
  align = 'end',
  className,
  ariaLabel,
}: PillowDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const endDate = maxDate ?? new Date();

  const yearItems = React.useMemo(() => {
    const source =
      years && years.length > 0
        ? [...years]
        : Array.from({ length: 6 }, (_, index) => endDate.getFullYear() - index);
    return source
      .slice()
      .sort((a, b) => b - a)
      .map((year) => ({ value: year, label: String(year) }));
  }, [years, endDate]);

  const minYear = yearItems[yearItems.length - 1]?.value ?? endDate.getFullYear();
  const maxYear = yearItems[0]?.value ?? endDate.getFullYear();

  const startMonth = React.useMemo(() => new Date(minYear, 0, 1), [minYear]);
  const endMonth = React.useMemo(
    () => new Date(maxYear, endDate.getMonth(), 1),
    [maxYear, endDate]
  );

  const [month, setMonth] = React.useState<Date>(() => startOfMonth(value ?? endDate));

  const formatted = value
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(value)
    : null;

  const updateMonth = (next: Date) => {
    setMonth(next);
    onMonthChange?.(next);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    // A selected date always needs to be on screen when the popover opens.
    // With no date selected, keep whatever month the user was browsing.
    if (next && value) {
      updateMonth(startOfMonth(value));
    }
  };

  const canGoPrevious = !isSameMonth(month, startMonth);
  const canGoNext = !isSameMonth(month, endMonth);

  const handleMonthSelect = (monthIndex: number) => {
    updateMonth(new Date(month.getFullYear(), monthIndex, 1));
  };

  const handleYearSelect = (year: number) => {
    const next = new Date(year, month.getMonth(), 1);
    updateMonth(next.getFullYear() > maxYear ? endMonth : next);
  };

  const isTodayUnavailable = React.useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return todayStart.getTime() > endDate.getTime();
  }, [endDate]);

  return (
    <div className={cn('relative inline-flex', className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={value ? 'secondary' : 'outline'}
            size="sm"
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn(
              'h-8 min-w-[7.5rem] gap-1.5 rounded-xl px-2.5 text-xs font-medium tabular-nums',
              value
                ? 'border-primary/30 bg-accent font-semibold text-primary'
                : 'text-muted-foreground hover:text-foreground',
              value && !disabled && 'pr-7'
            )}
          >
            <CalendarIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{formatted ?? placeholder}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[19.5rem] max-w-[calc(100vw-1rem)] p-0"
          align={align}
          sideOffset={8}
          collisionPadding={12}
        >
          <div className="flex flex-col gap-1 px-3 pt-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground">Date filter</span>
              <span className="truncate text-[11px] text-muted-foreground tabular-nums">
                {formatted ? `Selected: ${formatted}` : 'No date selected'}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => updateMonth(addMonths(month, -1))}
                disabled={!canGoPrevious}
                aria-label="Previous month"
                className="size-6 shrink-0 rounded-full p-0"
              >
                <ChevronLeft className="size-3.5" aria-hidden="true" />
              </Button>

              <PickerMenu
                label={MONTH_LABELS[month.getMonth()]}
                ariaLabel="Choose month"
                items={MONTH_LABELS.map((label, index) => ({ value: index, label }))}
                selectedValue={month.getMonth()}
                onSelect={handleMonthSelect}
                width="w-32"
              />

              <PickerMenu
                label={String(month.getFullYear())}
                ariaLabel="Choose year"
                items={yearItems}
                selectedValue={month.getFullYear()}
                onSelect={handleYearSelect}
                width="w-24"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => updateMonth(addMonths(month, 1))}
                disabled={!canGoNext}
                aria-label="Next month"
                className="ml-auto size-6 shrink-0 rounded-full p-0"
              >
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <Calendar
            mode="single"
            month={month}
            onMonthChange={updateMonth}
            startMonth={startMonth}
            endMonth={endMonth}
            selected={value}
            disabled={maxDate ? { after: maxDate } : undefined}
            aria-label="Choose a date to filter applications"
            classNames={{ nav: 'hidden', month_caption: 'sr-only' }}
            onSelect={(next) => {
              onChange?.(next);
              setOpen(false);
            }}
          />

          {maxDate && (
            <p className="px-3 pb-2 text-[10px] text-muted-foreground">
              Dates after today are unavailable.
            </p>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
            <span className="truncate text-[10px] font-medium text-muted-foreground tabular-nums">
              Browsing {month.getFullYear()}
            </span>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isTodayUnavailable}
                onClick={() => {
                  onChange?.(new Date());
                  setOpen(false);
                }}
                className="h-7 px-2.5 text-[11px] font-semibold"
              >
                Today
              </Button>

              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onChange?.(undefined);
                    setOpen(false);
                  }}
                  className="h-7 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange?.(undefined)}
          aria-label="Clear date filter"
          title="Clear date"
          className="absolute right-1 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-primary/70 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:-inset-1.5 after:content-['']"
        >
          <X className="size-3" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export { DatePicker };
