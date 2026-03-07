import { CircleCheck as CheckCircle2, Calendar, Clock, Sparkles, Car, User, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface ConfirmationStepProps {
  bookingData: {
    date: string;
    time: string;
    serviceType: string;
    vehicleType: string;
    customerName: string;
    customerPhone: string;
  };
  bookingId: string;
}

export function ConfirmationStep({ bookingData, bookingId }: ConfirmationStepProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Booking Confirmed</h2>
          <p className="text-sm sm:text-base text-gray-600">Your appointment is scheduled we will see your soon</p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 sm:p-6 mt-4 w-full max-w-sm">
          <p className="text-sm text-gray-600 mb-2">Your Booking Code</p>
          <p className="text-2xl sm:text-4xl font-bold text-[#1E90FF] tracking-wider">{bookingId}</p>
          <p className="text-xs text-gray-500 mt-2">Please save this code for your records</p>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-8 text-left space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Date</span>
            </div>
            <p className="font-semibold text-gray-900">{formatDate(bookingData.date)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Time</span>
            </div>
            <p className="font-semibold text-gray-900">{bookingData.time}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>Service</span>
            </div>
            <p className="font-semibold text-gray-900">{bookingData.serviceType}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Car className="w-4 h-4" />
              <span>Vehicle</span>
            </div>
            <p className="font-semibold text-gray-900">{bookingData.vehicleType}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{bookingData.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{bookingData.customerPhone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">What's Next ?</h4>
        <p className="text-sm text-gray-600">
          You will receive a confirmation email shortly. We'll send you a reminder 24 hours before your appointment.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
        <Button
          onClick={() => navigate('/book-now')}
          className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white"
        >
          Book Another Appointment
        </Button>
        <Button
          onClick={() => navigate('/view-bookings')}
          variant="outline"
          className="flex-1 h-12 text-gray-700 border-gray-300"
        >
          View My Bookings
        </Button>
      </div>
    </div>
  );
}
