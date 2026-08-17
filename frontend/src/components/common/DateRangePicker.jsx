import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval,
  isBefore, startOfWeek, endOfWeek, subDays, startOfDay
} from 'date-fns';

const PRESETS = [
  { label: 'Today', getValue: () => ({ start: startOfDay(new Date()), end: new Date() }) },
  { label: 'Last 7 Days', getValue: () => ({ start: subDays(new Date(), 6), end: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ start: subDays(new Date(), 29), end: new Date() }) },
  { label: 'This Month', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: 'Last Month', getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
  }}
];

const DateRangePicker = ({ value, onChange, placeholder = "Select dates..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value?.start || new Date());
  
  // Local state for dragging range
  const [selection, setSelection] = useState({ start: value?.start || null, end: value?.end || null });
  const [hoverDate, setHoverDate] = useState(null);
  
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const handleDateClick = (date) => {
    if (!selection.start || (selection.start && selection.end)) {
      setSelection({ start: date, end: null });
    } else {
      if (isBefore(date, selection.start)) {
        setSelection({ start: date, end: selection.start });
        onChange({ startDate: date, endDate: selection.start });
      } else {
        setSelection({ start: selection.start, end: date });
        onChange({ startDate: selection.start, endDate: date });
      }
      setIsOpen(false);
    }
  };

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getValue();
    setSelection({ start, end });
    onChange({ startDate: start, endDate: end });
    setCurrentMonth(start);
    setIsOpen(false);
  };

  const isSelected = (date) => {
    if (selection.start && isSameDay(date, selection.start)) return true;
    if (selection.end && isSameDay(date, selection.end)) return true;
    return false;
  };

  const isInRange = (date) => {
    if (!selection.start) return false;
    if (selection.start && selection.end) {
      return isWithinInterval(date, { start: selection.start, end: selection.end });
    }
    if (selection.start && hoverDate) {
      const start = isBefore(selection.start, hoverDate) ? selection.start : hoverDate;
      const end = isBefore(selection.start, hoverDate) ? hoverDate : selection.start;
      return isWithinInterval(date, { start, end });
    }
    return false;
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-[44px] px-4 rounded-xl text-sm font-medium border transition-all duration-200 outline-none w-full sm:w-auto min-w-[220px]"
        style={{ 
          background: 'var(--color-card)', 
          borderColor: isOpen ? 'var(--color-primary)' : 'var(--color-border)',
          color: (value?.start || selection.start) ? 'var(--color-text)' : 'var(--color-text-secondary)',
          boxShadow: isOpen ? '0 0 0 4px rgba(24,201,154,0.1)' : 'none'
        }}
      >
        <CalendarIcon className="w-4 h-4 text-[#64748B]" />
        <span className="flex-1 text-left whitespace-nowrap">
          {value?.start && value?.end 
            ? `${format(value.start, 'MMM d, yyyy')} - ${format(value.end, 'MMM d, yyyy')}`
            : placeholder}
        </span>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 animate-scale-in origin-top-left"
          style={{ 
            background: '#0B1022',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
          
          {/* Presets Sidebar */}
          <div className="flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 sm:pr-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className="text-left px-3 py-2 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendar Area */}
          <div className="flex flex-col min-w-[260px]">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-sm font-bold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[11px] font-bold text-[#64748B] py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {daysInMonth.map((date, i) => {
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const selected = isSelected(date);
                const inRange = isInRange(date);
                const isStart = selection.start && isSameDay(date, selection.start);
                const isEnd = selection.end && isSameDay(date, selection.end);

                let bgClass = "bg-transparent";
                if (selected) bgClass = "bg-[#18C99A] text-black font-bold shadow-[0_0_10px_rgba(24,201,154,0.4)]";
                else if (inRange) bgClass = "bg-[#18C99A]/15 text-white";
                else if (!isCurrentMonth) bgClass = "text-[#334155]";
                else bgClass = "text-[#E2E8F0] hover:bg-white/10";

                return (
                  <div 
                    key={date.toISOString()}
                    className="relative flex items-center justify-center h-8"
                  >
                    {/* Range background connect */}
                    {inRange && !isStart && !isEnd && (
                      <div className="absolute inset-0 bg-[#18C99A]/15 pointer-events-none" />
                    )}
                    {(isStart && selection.end) && (
                      <div className={`absolute inset-y-0 right-0 w-1/2 bg-[#18C99A]/15 pointer-events-none`} />
                    )}
                    {(isEnd && selection.start) && (
                      <div className={`absolute inset-y-0 left-0 w-1/2 bg-[#18C99A]/15 pointer-events-none`} />
                    )}

                    <button
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => setHoverDate(date)}
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[12px] transition-colors ${bgClass}`}
                    >
                      {format(date, 'd')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
