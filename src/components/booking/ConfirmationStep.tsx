import { Calendar, Clock, Sparkles, Car, User, Phone, Tag, Percent, Mail, MapPin, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import type { BookingData, DiscountInfo } from '../../pages/BookingPage';

interface ConfirmationStepProps {
  bookingData: BookingData;
  bookingId: string;
  discountInfo?: DiscountInfo | null;
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
  const isMultiCar = cars.length > 1;
  const cheapestPrice = isMultiCar ? Math.min(...cars.map(c => c.servicePrice)) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Booking Confirmed!</h2>
          <p className="text-gray-600 mt-2">Your booking has been successfully submitted</p>
        </div>
      </div>

      {/* Booking Code */}
      <div className="bg-gradient-to-r from-[#1E90FF] to-[#1873CC] rounded-xl p-6 text-white text-center">
        <p className="text-sm opacity-90 mb-2">Your Booking Code</p>
        <p className="text-3xl sm:text-4xl font-bold tracking-wider">{bookingId}</p>
        <p className="text-xs opacity-75 mt-3">Please save this code for your records</p>
      </div>

      {/* Main Details Card */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6">
        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#1E90FF] mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">{formatDate(bookingData.date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#1E90FF] mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-semibold text-gray-900">{bookingData.time}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="border-t pt-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#1E90FF] mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Service Location</p>
              <p className="font-semibold text-gray-900">
                {bookingData.houseNumber} {bookingData.streetName}
              </p>
              <p className="text-gray-600">
                {bookingData.city}, {bookingData.postCode}
              </p>
            </div>
          </div>
        </div>

        {/* Services Selected */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#1E90FF]" />
            <h3 className="font-semibold text-gray-900">
              {isMultiCar ? `Services (${cars.length} vehicles)` : 'Service Selected'}
            </h3>
          </div>
          <div className="space-y-3">
            {cars.map((car, index) => {
              const isFree = isMultiCar && 
                car.servicePrice === cheapestPrice && 
                index === cars.findIndex(c => c.servicePrice === cheapestPrice);

              return (
                <div key={car.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">Vehicle {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFree && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          FREE
                        </span>
                      )}
                      <span className={`font-semibold ${isFree ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        £{car.servicePrice}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 ml-6">{car.serviceType}</p>
                  <p className="text-xs text-gray-500 ml-6">Vehicle: {car.vehicleType}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Breakdown */}
        {discountInfo && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">£{discountInfo.originalTotal.toFixed(2)}</span>
              </div>
              
              {discountInfo.multiCarDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Multi-car discount (5th car free):
                  </span>
                  <span className="font-medium">-£{discountInfo.multiCarDiscount.toFixed(2)}</span>
                </div>
              )}
              
              {discountInfo.isFirstTime && discountInfo.firstTimeDiscount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    First-time customer discount (15%):
                  </span>
                  <span className="font-medium">-£{discountInfo.firstTimeDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total to Pay:</span>
                <span className="font-bold text-xl text-[#1E90FF]">£{discountInfo.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
          <div className="space-y-2 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{bookingData.customerName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{bookingData.customerEmail}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{bookingData.customerPhone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Home className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {bookingData.houseNumber} {bookingData.streetName}, {bookingData.city}, {bookingData.postCode}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
        <p className="text-sm text-gray-600 mb-3">
          We have received your booking and will review it shortly. You will receive a confirmation email once our team has verified your booking.
        </p>
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-100/50 rounded-lg p-3">
          <Clock className="w-4 h-4" />
          <span>Expected confirmation within 30 minutes during business hours</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={() => navigate('/book-now')}
          className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white"
        >
          Book Another Appointment
        </Button>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="flex-1 h-12 text-gray-700 border-gray-300"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}