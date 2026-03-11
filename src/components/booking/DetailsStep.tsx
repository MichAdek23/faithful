import { useState } from 'react';
import { User, Mail, Phone, Info, MapPin, Home, Building2, MapPinned } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../lib/supabase';

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
  onNext: (bookingId: string) => void;
  onBack: () => void;
  bookingData: {
    date: string;
    time: string;
    serviceType: string;
    servicePrice: number;
    vehicleType: string;
  };
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
  bookingData
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

  const generateBookingCode = (): string => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const createBookingWithUniqueCode = async (maxAttempts = 5): Promise<{ data: any; bookingCode: string }> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const bookingCode = generateBookingCode();

      const { data, error: submitError } = await supabase
        .from('bookings')
        .insert([
          {
            booking_code: bookingCode,
            booking_date: bookingData.date,
            booking_time: bookingData.time,
            service_type: bookingData.serviceType,
            service_price: bookingData.servicePrice,
            vehicle_type: bookingData.vehicleType,
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            house_number: houseNum,
            street_name: street,
            post_code: postcode,
            city: town,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (!submitError) {
        return { data, bookingCode };
      }

      if (submitError.code !== '23505') {
        throw submitError;
      }
    }

    throw new Error('Failed to generate unique booking code after multiple attempts');
  };

  const handleSubmit = async () => {
    if (!name || !email || !phone || !houseNum || !street || !postcode || !town) {
      setError('Please fill in all fields');
      return;
    }

    // Basic postcode validation (UK format)
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

      const { data, bookingCode } = await createBookingWithUniqueCode();

      await supabase.from('notifications').insert([
        {
          title: 'New Booking Received',
          message: `${name} booked ${bookingData.serviceType} for ${bookingData.vehicleType} on ${bookingData.date} at ${bookingData.time}`,
          type: 'booking',
          booking_id: data.id,
          is_read: false
        }
      ]);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
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
          service_type: bookingData.serviceType,
          service_price: bookingData.servicePrice,
          vehicle_type: bookingData.vehicleType,
        }),
      });

      onDetailsChange({ 
        customerName: name, 
        customerEmail: email, 
        customerPhone: phone,
        houseNumber: houseNum,
        streetName: street,
        postCode: postcode,
        city: town
      });
      onNext(bookingCode);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
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

      {/* Address Section */}
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

      {/* Booking Summary */}
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
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{bookingData.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-medium">{bookingData.vehicleType}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-[#1E90FF]">£{bookingData.servicePrice}</span>
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