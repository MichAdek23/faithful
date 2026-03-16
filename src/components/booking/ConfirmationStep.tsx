import { Calendar, Clock, Sparkles, Car, User, Phone, Tag, Percent } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import type { BookingData } from '../../pages/BookingPage';

interface ConfirmationStepProps {
  bookingData: BookingData;
  bookingId: string;
  discountInfo?: {
    isFirstTime: boolean;
    firstTimeDiscount: number;
    multiCarDiscount: number;
    originalTotal: number;
    finalTotal: number;
  } | null;
}

export function ConfirmationStep({ bookingData, bookingId, discountInfo }: ConfirmationStepProps) {
  const navigate = useNavigate();
  const cars = bookingData.cars || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const hasDiscount = discountInfo && (discountInfo.multiCarDiscount > 0 || discountInfo.firstTimeDiscount > 0);

  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Booking Submitted</h2>
          <p className="text-sm sm:text-base text-gray-600">Your booking is pending confirmation from our team</p>
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
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>{cars.length > 1 ? `Vehicles (${cars.length})` : 'Service'}</span>
          </div>
          <div className="space-y-2">
            {cars.map((car, i) => {
              const isFree = discountInfo && discountInfo.multiCarDiscount > 0 &&
                car.servicePrice === Math.min(...cars.map(c => c.servicePrice)) &&
                i === cars.findIndex(c => c.servicePrice === Math.min(...cars.map(x => x.servicePrice)));

              return (
                <div key={car.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{car.serviceType}</p>
                      <p className="text-xs text-gray-500">{car.vehicleType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isFree && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">FREE</span>
                    )}
                    <span className={`text-sm font-semibold ${isFree ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      £{car.servicePrice}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {hasDiscount && discountInfo && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">£{discountInfo.originalTotal}</span>
            </div>
            {discountInfo.multiCarDiscount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Multi-car deal (1 free):
                </span>
                <span className="font-medium">-£{discountInfo.multiCarDiscount}</span>
              </div>
            )}
            {discountInfo.isFirstTime && discountInfo.firstTimeDiscount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  First-time discount (15%):
                </span>
                <span className="font-medium">-£{discountInfo.firstTimeDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t text-sm">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg text-[#1E90FF]">£{discountInfo.finalTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {!hasDiscount && discountInfo && (
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg text-[#1E90FF]">£{discountInfo.finalTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
        <p className="text-sm text-gray-600">
          We have received your booking and will review it shortly. You will receive an email once your booking has been confirmed by our team.
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
