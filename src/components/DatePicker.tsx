import React, { useState, useRef, useEffect } from 'react';
import {
  IconCalendar as Calendar,
  IconChevronLeft as ChevronLeft,
  IconChevronRight as ChevronRight,
  IconX as X,
} from '@tabler/icons-react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTHS_FULL: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sept: 8, sep: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  className = '',
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [align, setAlign] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);

  // Open popover with safe position: avoid overflowing right edge of viewport
  const openPopover = () => {
    if (disabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect && typeof window !== 'undefined') {
      const popoverWidth = Math.min(256, window.innerWidth - 32);
      const spaceRight = window.innerWidth - rect.left;
      setAlign(spaceRight < popoverWidth + 12 ? 'right' : 'left');
    }
    setIsOpen(true);
  };

  // Parse initial view year and selected month from current value
  const parseValue = (val: string) => {
    if (!val) {
      const now = new Date();
      return { year: now.getFullYear(), month: null as number | null };
    }

    const yearMatch = val.match(/\b(19\d\d|20\d\d)\b/);
    const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

    const words = val.toLowerCase().replace(/[^a-z]/g, ' ').split(/\s+/).filter(Boolean);
    let parsedMonth: number | null = null;

    for (const w of words) {
      if (MONTHS_FULL[w] !== undefined) {
        parsedMonth = MONTHS_FULL[w];
        break;
      }
    }

    return { year: parsedYear, month: parsedMonth };
  };

  const parsed = parseValue(value);
  const [viewYear, setViewYear] = useState<number>(parsed.year);

  // Sync viewYear when popover opens or value changes
  useEffect(() => {
    if (isOpen) {
      const p = parseValue(value);
      setViewYear(p.year);
    }
  }, [isOpen, value]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelectMonth = (monthIndex: number) => {
    const formatted = `${MONTHS_SHORT[monthIndex]} ${viewYear}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    onChange(`${MONTHS_SHORT[now.getMonth()]} ${now.getFullYear()}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel || placeholder}
          onClick={() => {
            if (!disabled) {
              if (isOpen) setIsOpen(false);
              else openPopover();
            }
          }}
          className={`w-full rounded-lg border border-input px-2.5 py-1.5 pr-14 text-xs text-foreground transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 ${
            disabled ? 'cursor-not-allowed bg-muted text-muted-foreground' : 'cursor-pointer bg-card'
          } ${className}`}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="rounded p-0.5 text-muted-foreground transition hover:text-foreground"
              title="Clear date"
              aria-label="Clear date"
            >
              <X size={12} />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                if (isOpen) setIsOpen(false);
                else openPopover();
              }
            }}
            className={`rounded p-0.5 transition ${
              disabled ? 'cursor-not-allowed text-muted-foreground/60' : 'text-muted-foreground hover:text-primary'
            }`}
            title="Open date picker"
            aria-label="Open date picker"
          >
            <Calendar size={14} />
          </button>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full z-50 mt-1 w-full max-w-[calc(100vw-1.5rem)] rounded-xl border border-border bg-popover p-3 font-sans shadow-lg sm:w-64`}>
          {/* Header: Year Navigation */}
          <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Previous year"
              aria-label="Previous year"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-semibold text-foreground">
              {viewYear}
            </span>

            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              title="Next year"
              aria-label="Next year"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Month Grid (4 columns x 3 rows) */}
          <div className="grid grid-cols-4 gap-1.5 py-1">
            {MONTHS_SHORT.map((month, idx) => {
              const isSelected = parsed.year === viewYear && parsed.month === idx;

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={`rounded-lg py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-accent hover:text-primary'
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px]">
            <button
              type="button"
              onClick={handleCurrentMonth}
              className="font-semibold text-primary hover:underline"
            >
              This month
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground transition hover:text-destructive"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
