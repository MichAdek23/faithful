import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '../ui/button';

interface DateStepProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  onNext: () => void;
}

export function DateStep({ selectedDate, onDateSelect, onNext }: DateStepProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate || '');

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const formatDateString = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDateClick = (day: number) => {
    const dateString = formatDateString(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setLocalSelectedDate(dateString);
    onDateSelect(dateString);
  };

  const handleNext = () => {
    if (localSelectedDate) {
      onNext();
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (day: number) => {
    if (!localSelectedDate) return false;
    return formatDateString(currentMonth.getFullYear(), currentMonth.getMonth(), day) === localSelectedDate;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-900">Select a Date</h3>
      </div>

      <div className="bg-white rounded-lg">
        <div className="flex items-center justify-between mb-6 px-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const disabled = isDateDisabled(day);
            const selected = isDateSelected(day);

            return (
              <button
                key={day}
                onClick={() => !disabled && handleDateClick(day)}
                disabled={disabled}
                className={`
                  aspect-square rounded-full flex items-center justify-center text-sm font-medium
                  transition-all
                  ${disabled ? 'text-gray-300 cursor-not-allowed opacity-40 blur-[0.5px]' : 'hover:bg-gray-100 cursor-pointer'}
                  ${selected ? 'bg-[#1E90FF] text-white hover:bg-[#1873CC]' : 'text-gray-900'}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button
          variant="outline"
          className="flex-1 h-12 text-gray-700 border-gray-300"
          disabled
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!localSelectedDate}
          className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
