import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '../ui/button';

interface DateStepProps {
  selectedDate?: string;
  onDateSelect: (date: string, sameDayFee?: number) => void;
  onNext: () => void;
}

export function DateStep({ selectedDate, onDateSelect, onNext }: DateStepProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate || '');
  const [sameDayFee, setSameDayFee] = useState<number | undefined>(undefined);

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

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return year === today.getFullYear() && 
           month === today.getMonth() && 
           day === today.getDate();
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateString = formatDateString(year, month, day);
    
    // Check if selected date is today
    const isSameDayBooking = isToday(year, month, day);
    const fee = isSameDayBooking ? 5 : undefined;
    
    setLocalSelectedDate(dateString);
    setSameDayFee(fee);
    onDateSelect(dateString, fee);
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

  const isDateToday = (day: number) => {
    return isToday(currentMonth.getFullYear(), currentMonth.getMonth(), day);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-900">Select a Date</h3>
      </div>

      {/* Same-day booking notice */}
      {sameDayFee && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Same-day booking fee:</span> £{sameDayFee} will be added to your total.
              </p>
            </div>
          </div>
        </div>
      )}

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
            const isTodayDate = isDateToday(day);

            return (
              <button
                key={day}
                onClick={() => !disabled && handleDateClick(day)}
                disabled={disabled}
                className={`
                  aspect-square rounded-full flex items-center justify-center text-sm font-medium
                  transition-all relative
                  ${disabled ? 'text-gray-300 cursor-not-allowed opacity-40 blur-[0.5px]' : 'hover:bg-gray-100 cursor-pointer'}
                  ${selected ? 'bg-[#1E90FF] text-white hover:bg-[#1873CC]' : 'text-gray-900'}
                `}
              >
                {day}
                {isTodayDate && !disabled && !selected && (
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#1E90FF] rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Display fee in the button area if selected */}
      {localSelectedDate && sameDayFee && (
        <div className="bg-gray-50 p-3 rounded-md text-center">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Same-day booking fee: £{sameDayFee}</span> will be added at checkout
          </p>
        </div>
      )}

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
          Next {sameDayFee && `(+ £${sameDayFee})`}
        </Button>
      </div>
    </div>
  );
}