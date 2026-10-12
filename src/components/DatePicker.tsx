import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
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
  placeholder = 'Pilih Tanggal',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
          onClick={() => {
            if (!disabled) setIsOpen(true);
          }}
          className={`w-full px-2.5 py-1.5 pr-14 text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition ${
            disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white cursor-pointer'
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
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
              title="Clear date"
            >
              <X size={12} />
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) setIsOpen(!isOpen);
            }}
            className={`p-0.5 rounded transition ${
              disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-500 hover:text-emerald-600'
            }`}
            title="Open Date Picker"
          >
            <Calendar size={14} />
          </button>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute left-0 top-full mt-1 z-50 w-full sm:w-64 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-slate-200/90 shadow-lg p-3 font-sans animate-in fade-in duration-100">
          {/* Header: Year Navigation */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
              title="Previous Year"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-bold text-xs text-slate-900 tracking-wider">
              {viewYear}
            </span>

            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
              title="Next Year"
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
                  className={`py-1.5 text-xs rounded-lg transition font-medium ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={handleCurrentMonth}
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
            >
              Bulan Ini
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-red-600 transition"
            >
              Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
