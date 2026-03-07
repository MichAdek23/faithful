import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';

interface TimeStepProps {
  selectedTime?: string;
  selectedDate?: string;
  onTimeSelect: (time: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const timeSlots = [
  '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM',
  '07:00 AM', '08:30 AM', '10:00 AM', '12:30 PM',
  '02:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
  '07:00 PM', '08:30 PM', '09:00 PM', '10:00 PM'
];

export function TimeStep({ selectedTime, selectedDate, onTimeSelect, onNext, onBack }: TimeStepProps) {
  const [localSelectedTime, setLocalSelectedTime] = useState(selectedTime || '');
  const [timeSlotCounts, setTimeSlotCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedDate) {
      fetchBookedTimes();
    }
  }, [selectedDate]);

  const fetchBookedTimes = async () => {
    if (!selectedDate) return;

    const { data, error } = await supabase
      .from('bookings')
      .select('booking_time')
      .eq('booking_date', selectedDate);

    if (!error && data) {
      const counts: Record<string, number> = {};
      data.forEach((booking) => {
        counts[booking.booking_time] = (counts[booking.booking_time] || 0) + 1;
      });
      setTimeSlotCounts(counts);
    }
  };

  const handleTimeClick = (time: string) => {
    setLocalSelectedTime(time);
    onTimeSelect(time);
  };

  const handleNext = () => {
    if (localSelectedTime) {
      onNext();
    }
  };

  const isTimeBooked = (time: string) => {
    return (timeSlotCounts[time] || 0) >= 3;
  };

  const getSlotsRemaining = (time: string) => {
    const count = timeSlotCounts[time] || 0;
    return 3 - count;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-900">Select Time</h3>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {timeSlots.map((time) => {
          const booked = isTimeBooked(time);
          const selected = localSelectedTime === time;
          const slotsRemaining = getSlotsRemaining(time);

          return (
            <button
              key={time}
              onClick={() => !booked && handleTimeClick(time)}
              disabled={booked}
              className={`
                p-4 rounded-lg border-2 text-center font-medium transition-all relative
                ${booked ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50 blur-[0.5px]' : ''}
                ${!booked && !selected ? 'border-gray-300 bg-white hover:border-[#1E90FF] hover:bg-blue-50 cursor-pointer' : ''}
                ${selected ? 'border-[#1E90FF] bg-[#1E90FF] text-white' : 'text-gray-900'}
              `}
            >
              <div>{time}</div>
              {!booked && slotsRemaining < 3 && (
                <div className={`text-xs mt-1 ${selected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {slotsRemaining} {slotsRemaining === 1 ? 'spot' : 'spots'} left
                </div>
              )}
              {booked && (
                <div className="text-xs mt-1">Full</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 text-gray-700 border-gray-300"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!localSelectedTime}
          className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
