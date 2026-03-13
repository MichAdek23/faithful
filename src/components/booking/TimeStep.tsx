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

/* Maximum bookings per slot */
const SLOT_CAPACITY = 2;

/* Generate time slots dynamically */
const generateTimeSlots = (startHour: number, endHour: number, interval = 15) => {
  const slots: string[] = [];

  const date = new Date();
  date.setHours(startHour, 0, 0, 0);

  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  while (date <= end) {
    const formatted = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    slots.push(formatted);
    date.setMinutes(date.getMinutes() + interval);
  }

  return slots;
};

/* Create slots from 5AM → 10PM every 15 minutes */
const timeSlots = generateTimeSlots(5, 22, 15);

export function TimeStep({
  selectedTime,
  selectedDate,
  onTimeSelect,
  onNext,
  onBack,
}: TimeStepProps) {
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
        counts[booking.booking_time] =
          (counts[booking.booking_time] || 0) + 1;
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
    return (timeSlotCounts[time] || 0) >= SLOT_CAPACITY;
  };

  const getSlotsRemaining = (time: string) => {
    const count = timeSlotCounts[time] || 0;
    return SLOT_CAPACITY - count;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-900">
          Select Time
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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

              {!booked && slotsRemaining < SLOT_CAPACITY && (
                <div
                  className={`text-xs mt-1 ${
                    selected ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {slotsRemaining} {slotsRemaining === 1 ? 'spot' : 'spots'} left
                </div>
              )}

              {booked && (
                <div className="text-xs mt-1">
                  Full
                </div>
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