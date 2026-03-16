import { useState, useEffect } from 'react';
import { User, Mail, Phone, Info, MapPin, Chrome as Home, Building2, MapPinned, Tag, Gift, Percent } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../lib/supabase';
import type { BookingData } from '../../pages/BookingPage';

interface DiscountInfo {
  isFirstTime: boolean;
  firstTimeDiscount: number;
  multiCarDiscount: number;
  originalTotal: number;
  finalTotal: number;
}

interface DetailsStepProps {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  houseNumber?: string;
  streetName?: string;
  postCode?: string;
  city?: string;
  onDetailsChange: (data: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    houseNumber?: string;
    streetName?: string;
    postCode?: string;
    city?: string;
  }) => void;
  onNext: (bookingId: string, discountInfo?: DiscountInfo) => void;
  onBack: () => void;
  bookingData: BookingData;
}

function calculateDiscounts(cars: BookingData['cars'], isFirstTime: boolean): DiscountInfo {
  const originalTotal = cars.reduce((sum, c) => sum + c.servicePrice, 0);
  let multiCarDiscount = 0;
  let afterMultiCar = originalTotal;

  if (cars.length >= 5) {
    const cheapest = Math.min(...cars.map(c => c.servicePrice));
    multiCarDiscount = cheapest;
    afterMultiCar = originalTotal - cheapest;
  }

  let firstTimeDiscount = 0;
  if (isFirstTime) {
    firstTimeDiscount = Math.round(afterMultiCar * 0.15 * 100) / 100;
  }

  const finalTotal = Math.max(0, afterMultiCar - firstTimeDiscount);

  return { isFirstTime, firstTimeDiscount, multiCarDiscount, originalTotal, finalTotal };
}

export function DetailsStep({
  customerName,
  customerEmail,
  customerPhone,
  houseNumber,
  streetName,
  postCode,
  city,
  onDetailsChange,
  onNext,
  onBack,
  bookingData,
}: DetailsStepProps) {
  const [name, setName] = useState(customerName || '');
  const [email, setEmail] = useState(customerEmail || '');
  const [phone, setPhone] = useState(customerPhone || '');
  const [houseNum, setHouseNum] = useState(houseNumber || '');
  const [street, setStreet] = useState(streetName || '');
  const [postcode, setPostcode] = useState(postCode || '');
  const [town, setTown] = useState(city || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const cars = bookingData.cars || [];
  const discount = calculateDiscounts(cars, isFirstTime === true);

  useEffect(() => {
    if (!email) {
      setIsFirstTime(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    const timeout = setTimeout(async () => {
      setCheckingEmail(true);
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('customer_email', email);
      setIsFirstTime(count === 0);
      setCheckingEmail(false);
    }, 600);

    return () => clearTimeout(timeout);
  }, [email]);

  const generateBookingCode = (): string => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const handleSubmit = async () => {
    if (!name || !email || !phone || !houseNum || !street || !postcode || !town) {
      setError('Please fill in all fields');
      return;
    }

    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode.replace(/\s/g, ''))) {
      setError('Please enter a valid UK postcode');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', bookingData.date)
        .eq('booking_time', bookingData.time)
        .eq('customer_email', email)
        .maybeSingle();

      if (existingBooking) {
        setError('You have already booked this time slot. Please select a different time.');
        setIsSubmitting(false);
        return;
      }

      const { data: bookingCount } = await supabase
        .from('bookings')
        .select('id', { count: 'exact' })
        .eq('booking_date', bookingData.date)
        .eq('booking_time', bookingData.time);

      if (bookingCount && bookingCount.length >= 3) {
        setError('This time slot is now full. Please select a different time.');
        setIsSubmitting(false);
        return;
      }

      const groupId = crypto.randomUUID();
      const bookingCode = generateBookingCode();
      const cheapestPrice = cars.length >= 5 ? Math.min(...cars.map(c => c.servicePrice)) : 0;
      let cheapestUsed = false;

      const bookingRows = cars.map((car) => {
        let discountAmount = 0;
        let discountType: string | null = null;

        const isCheapest = cars.length >= 5 && !cheapestUsed && car.servicePrice === cheapestPrice;
        if (isCheapest) {
          cheapestUsed = true;
          discountAmount = car.servicePrice;
          discountType = 'multi_car_free';
        }

        const remainingPrice = car.servicePrice - discountAmount;
        let firstTimeAmt = 0;
        if (isFirstTime && remainingPrice > 0) {
          firstTimeAmt = Math.round(remainingPrice * 0.15 * 100) / 100;
          discountAmount += firstTimeAmt;
          discountType = discountType ? `${discountType}+first_time` : 'first_time';
        }

        const finalPrice = Math.max(0, Math.round((car.servicePrice - discountAmount) * 100) / 100);

        return {
          booking_code: bookingCode,
          group_id: cars.length > 1 ? groupId : null,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          service_type: car.serviceType,
          original_price: car.servicePrice,
          service_price: finalPrice,
          vehicle_type: car.vehicleType,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          house_number: houseNum,
          street_name: street,
          post_code: postcode,
          city: town,
          status: 'pending',
          discount_amount: discountAmount,
          discount_type: discountType,
        };
      });

      const { data, error: submitError } = await supabase
        .from('bookings')
        .insert(bookingRows)
        .select();

      if (submitError) {
        if (submitError.code === '23505') {
          setError('Duplicate booking code. Please try again.');
          setIsSubmitting(false);
          return;
        }
        throw submitError;
      }

      const primaryBooking = data?.[0];
      if (primaryBooking) {
        const carSummary = cars.length === 1
          ? `${cars[0].serviceType} for ${cars[0].vehicleType}`
          : `${cars.length} cars (${cars.map(c => c.vehicleType).join(', ')})`;

        await supabase.from('notifications').insert([
          {
            title: 'New Booking Received',
            message: `${name} booked ${carSummary} on ${bookingData.date} at ${bookingData.time}`,
            type: 'booking',
            booking_id: primaryBooking.id,
            is_read: false,
          },
        ]);
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingCode,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          house_number: houseNum,
          street_name: street,
          post_code: postcode,
          city: town,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          service_type: cars.length === 1 ? cars[0].serviceType : `${cars.length} Cars`,
          service_price: discount.finalTotal,
          vehicle_type: cars.length === 1 ? cars[0].vehicleType : cars.map(c => c.vehicleType).join(', '),
          cars: cars.map(c => ({
            serviceType: c.serviceType,
            vehicleType: c.vehicleType,
            servicePrice: c.servicePrice,
          })),
          discount_info: {
            is_first_time: isFirstTime,
            first_time_discount: discount.firstTimeDiscount,
            multi_car_discount: discount.multiCarDiscount,
            original_total: discount.originalTotal,
            final_total: discount.finalTotal,
          },
        }),
      });

      onDetailsChange({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        houseNumber: houseNum,
        streetName: street,
        postCode: postcode,
        city: town,
      });
      onNext(bookingCode, discount);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-[#1E90FF]" />
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Full Name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                onDetailsChange({ customerName: e.target.value });
              }}
              className="h-12"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                onDetailsChange({ customerEmail: e.target.value });
              }}
              className="h-12"
            />
            {checkingEmail && (
              <p className="text-xs text-gray-400 mt-1">Checking for welcome discount...</p>
            )}
            {isFirstTime === true && !checkingEmail && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Gift className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-xs font-medium text-emerald-600">
                  Welcome! You qualify for a 15% first-time customer discount.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="07123 456789"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9+\s()-]/g, '');
                setPhone(val);
                onDetailsChange({ customerPhone: val });
              }}
              className="h-12"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-5 h-5 text-[#1E90FF]" />
          <h3 className="text-lg font-semibold text-gray-900">Your Address Here</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Home className="w-4 h-4" />
              House/Flat Number
            </label>
            <Input
              type="text"
              placeholder="123 or Flat 4B"
              value={houseNum}
              onChange={(e) => {
                setHouseNum(e.target.value);
                onDetailsChange({ houseNumber: e.target.value });
              }}
              className="h-12"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4" />
              Street Name
            </label>
            <Input
              type="text"
              placeholder="High Street"
              value={street}
              onChange={(e) => {
                setStreet(e.target.value);
                onDetailsChange({ streetName: e.target.value });
              }}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPinned className="w-4 h-4" />
                Post Code
              </label>
              <Input
                type="text"
                placeholder="SW1A 1AA"
                value={postcode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setPostcode(val);
                  onDetailsChange({ postCode: val });
                }}
                className="h-12"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4" />
                Town/City
              </label>
              <Input
                type="text"
                placeholder="London"
                value={town}
                onChange={(e) => {
                  setTown(e.target.value);
                  onDetailsChange({ city: e.target.value });
                }}
                className="h-12"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{bookingData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{bookingData.time}</span>
            </div>

            <div className="border-t pt-2 mt-2 space-y-2">
              {cars.map((car, i) => {
                const isFree = cars.length >= 5 && car.servicePrice === Math.min(...cars.map(c => c.servicePrice)) && i === cars.findIndex(c => c.servicePrice === Math.min(...cars.map(x => x.servicePrice)));
                return (
                  <div key={car.id} className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {car.serviceType} ({car.vehicleType})
                    </span>
                    <div className="flex items-center gap-2">
                      {isFree && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">FREE</span>
                      )}
                      <span className={`font-medium ${isFree ? 'line-through text-gray-400' : ''}`}>
                        £{car.servicePrice}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">£{discount.originalTotal}</span>
              </div>

              {discount.multiCarDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Multi-car deal (1 free):
                  </span>
                  <span className="font-medium">-£{discount.multiCarDiscount}</span>
                </div>
              )}

              {discount.isFirstTime && discount.firstTimeDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    First-time discount (15%):
                  </span>
                  <span className="font-medium">-£{discount.firstTimeDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between pt-1 border-t">
                <span className="text-gray-900 font-semibold">Total:</span>
                <span className="font-bold text-lg text-[#1E90FF]">£{discount.finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          We'll use your information to confirm your booking and send you a reminder.
          Our technician will visit the provided address at the scheduled time.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-4 pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 text-gray-700 border-gray-300"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!name || !email || !phone || !houseNum || !street || !postcode || !town || isSubmitting}
          className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white"
        >
          {isSubmitting ? 'Processing...' : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  );
}
