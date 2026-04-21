import { Calendar, Clock, Sparkles, Car, User, Phone, Tag, Percent, Mail, MapPin, Chrome as Home, Truck, Wrench } from 'lucide-react';
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

  // Helper to get vehicle icon based on type and service
  const getVehicleIcon = (vehicleType: string, serviceType?: string) => {
    if (serviceType?.includes('Engine')) return Wrench;
    if (vehicleType === 'Van') return Truck;
    if (vehicleType === 'Car') return Car;
    return Car;
  };

  // Helper to get service category label
  const getServiceCategoryLabel = (serviceType: string, vehicleType: string) => {
    if (serviceType?.includes('Engine')) return 'Engine Service';
    if (vehicleType === 'Van') return 'Van Service';
    if (vehicleType === 'Car') return 'Car Service';
    return 'Service';
  };

  // Check if there's a same-day fee
  const hasSameDayFee = discountInfo?.sameDayFee && discountInfo.sameDayFee > 0;
  
  // Check if there are any discounts or additional fees to display
  const hasDiscount = discountInfo && (
    discountInfo.firstTimeDiscount > 0 ||
    (discountInfo.conditionFees && discountInfo.conditionFees > 0) ||
    (discountInfo.locationSurcharge && discountInfo.locationSurcharge > 0) ||
    hasSameDayFee
  );
  
  const isMultiCar = cars.length > 1;
  const hasVans = cars.some(car => car.vehicleType === 'Van');
  const hasEngineService = cars.some(car => car.serviceType?.includes('Engine'));

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
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Sparkles className="w-5 h-5 text-[#1E90FF]" />
            <h3 className="font-semibold text-gray-900">
              {isMultiCar ? `Services (${cars.length} vehicles)` : 'Service Selected'}
            </h3>
            {hasVans && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Includes Van Service
              </span>
            )}
            {hasEngineService && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                Includes Engine Service
              </span>
            )}
          </div>
          <div className="space-y-3">
            {cars.map((car, index) => {
              // Price per car includes any condition fee
              const perCarTotal = car.servicePrice + (car.conditionFee ?? 0);
              const VehicleIcon = getVehicleIcon(car.vehicleType, car.serviceType);
              const serviceCategory = getServiceCategoryLabel(car.serviceType || '', car.vehicleType);
              const isEngineService = car.serviceType?.includes('Engine');
              const isVanService = car.vehicleType === 'Van' && !isEngineService;
              
              return (
                <div key={car.id} className={`rounded-lg p-4 ${
                  isEngineService ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <VehicleIcon className={`w-4 h-4 ${
                        isEngineService ? 'text-orange-600' : 'text-gray-500'
                      }`} />
                      <span className="font-medium text-gray-900">
                        {serviceCategory} {index + 1}
                      </span>
                      {isVanService && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          Commercial
                        </span>
                      )}
                      {isEngineService && (
                        <span className="text-[10px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded">
                          Engine Bay
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        £{perCarTotal.toFixed(2)}
                      </span>
                      {car.serviceType?.includes('month') && (
                        <span className="text-xs text-gray-500">/month</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 ml-6">
                    {car.serviceType?.replace(` – £${car.servicePrice}`, '') || 'Service not selected'}
                  </p>
                  {car.vehicleDetails && car.vehicleDetails.trim().length > 0 && (
                    <p className="text-xs text-gray-500 ml-6 mt-1">Details: {car.vehicleDetails}</p>
                  )}
                  {!isEngineService && car.vehicleCondition && car.vehicleCondition !== 'mild' && (
                    <p className="text-xs text-gray-500 ml-6">
                      Condition: {car.vehicleCondition.replace('_', ' ')} 
                      <span className="text-emerald-600 ml-1">
                        (+£{car.conditionFee})
                      </span>
                    </p>
                  )}
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
              {/* Base subtotal (services only) */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service subtotal:</span>
                <span className="font-medium">
                  £{(discountInfo.originalTotal - (discountInfo.sameDayFee || 0) - (discountInfo.locationSurcharge || 0)).toFixed(2)}
                </span>
              </div>
              
              {/* Condition fees summary */}
              {discountInfo.conditionFees && discountInfo.conditionFees > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Condition fees:
                  </span>
                  <span className="font-medium">+£{discountInfo.conditionFees.toFixed(2)}</span>
                </div>
              )}

              {/* Location surcharge summary */}
              {discountInfo.locationSurcharge && discountInfo.locationSurcharge > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location surcharge:
                  </span>
                  <span className="font-medium">+£{discountInfo.locationSurcharge.toFixed(2)}</span>
                </div>
              )}

              {/* Same-day booking fee */}
              {discountInfo.sameDayFee && discountInfo.sameDayFee > 0 && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Same-day booking fee:
                  </span>
                  <span className="font-medium">+£{discountInfo.sameDayFee.toFixed(2)}</span>
                </div>
              )}
              
              {/* First-time customer discount */}
              {discountInfo.isFirstTime && discountInfo.firstTimeDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    First-time discount (15%):
                  </span>
                  <span className="font-medium">-£{discountInfo.firstTimeDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total to Pay:</span>
                <span className="font-bold text-xl text-[#1E90FF]">£{discountInfo.finalTotal.toFixed(2)}</span>
              </div>

              {/* Payment note */}
              <p className="text-xs text-gray-500 text-right mt-1">
                Payment to be made on the day of service
              </p>
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

      {/* Service-specific notes */}
      {hasVans && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Van Service Information</h4>
              <p className="text-sm text-blue-700 mt-1">
                Please ensure the van is accessible and there is adequate space for our equipment. 
                For commercial vehicles, please remove any valuable items or sensitive materials from the cargo area before our arrival.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasEngineService && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Wrench className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900">Engine Detailing Information</h4>
              <p className="text-sm text-orange-700 mt-1">
                For engine detailing, please ensure the engine has cooled down before our arrival. 
                We recommend not driving the vehicle for at least 30 minutes prior to the service time.
                The engine bay will be thoroughly cleaned, degreased, and protected.
              </p>
            </div>
          </div>
        </div>
      )}

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
          onClick={() => {
            localStorage.removeItem('faithful-booking-draft');
            window.location.href = '/book-now';
          }}
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