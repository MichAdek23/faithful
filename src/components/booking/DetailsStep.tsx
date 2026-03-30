import { useState, useEffect } from 'react';
import { User, Mail, Phone, Info, MapPin, Chrome as Home, Building2, MapPinned, Navigation, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../lib/supabase';
// BookingData no longer needed in this component since we moved surcharge logic into ServiceStep

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
  /**
   * Optional distance in minutes from the service area. A surcharge will be
   * applied during the booking if this exceeds five minutes. Undefined or
   * zero is treated as no surcharge.
   */
  distanceFromServiceArea?: number;
  onDetailsChange: (data: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    houseNumber?: string;
    streetName?: string;
    postCode?: string;
    city?: string;
    distanceFromServiceArea?: number;
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

// Service area coordinates — 23 Chalkdown, Luton, LU2 7FH
const SERVICE_AREA_LAT = 51.9029;
const SERVICE_AREA_LNG = -0.3912;

/**
 * Haversine formula — returns straight-line distance in km between two
 * lat/lng points. We convert this to an approximate driving time by
 * assuming an average urban speed of 30 km/h and adding a 1.4x road
 * factor for typical UK urban routes.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateDrivingMinutes(lat: number, lng: number): number {
  const straightKm = haversineKm(lat, lng, SERVICE_AREA_LAT, SERVICE_AREA_LNG);
  // Road factor 1.4x straight-line distance, 30 km/h average urban speed
  const drivingKm = straightKm * 1.4;
  return (drivingKm / 30) * 60;
}

export function DetailsStep({
  customerName,
  customerEmail,
  customerPhone,
  houseNumber,
  streetName,
  postCode,
  city,
  distanceFromServiceArea,
  onDetailsChange,
  onNext,
  onBack,
}: DetailsStepProps) {
  const [name, setName] = useState(customerName || '');
  const [email, setEmail] = useState(customerEmail || '');
  const [phone, setPhone] = useState(customerPhone || '');
  const [houseNum, setHouseNum] = useState(houseNumber || '');
  const [street, setStreet] = useState(streetName || '');
  const [postcode, setPostcode] = useState(postCode || '');
  const [town, setTown] = useState(city || '');

  // Geolocation state
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'checking' | 'surcharge' | 'no_surcharge' | 'denied' | 'error'
  >('idle');
  const [drivingMinutes, setDrivingMinutes] = useState<number | null>(null);

  const [distance, setDistance] = useState<number>(
    typeof distanceFromServiceArea === 'number' ? distanceFromServiceArea : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

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

  const checkLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('checking');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const mins = estimateDrivingMinutes(
          position.coords.latitude,
          position.coords.longitude
        );
        const roundedMins = Math.round(mins * 10) / 10;
        setDrivingMinutes(roundedMins);
        setDistance(roundedMins);
        onDetailsChange({ distanceFromServiceArea: roundedMins });

        if (roundedMins > 5) {
          setLocationStatus('surcharge');
        } else {
          setLocationStatus('no_surcharge');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('error');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleNext = () => {
    if (!name || !email || !phone || !houseNum || !street || !postcode || !town) {
      setError('Please fill in all fields');
      return;
    }

    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode.replace(/\s/g, ''))) {
      setError('Please enter a valid UK postcode');
      return;
    }

    onDetailsChange({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      houseNumber: houseNum,
      streetName: street,
      postCode: postcode,
      city: town,
    });

    onNext();
  };

  const allFieldsFilled = name && email && phone && houseNum && street && postcode && town;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <User className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-900">Your Details</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
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
                <p className="text-xs text-emerald-600 mt-1">
                  Welcome! You qualify for a 15% first-time customer discount.
                </p>
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
          <h4 className="text-lg font-medium text-gray-900 mb-4">Your Address</h4>
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

            {/* Location surcharge checker */}
            <div className="mt-2 rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1E90FF]" />
                  <span className="text-sm font-medium text-gray-700">Location surcharge check</span>
                </div>
                <button
                  type="button"
                  onClick={checkLocation}
                  disabled={locationStatus === 'checking'}
                  className="flex items-center gap-1.5 text-xs font-medium text-white bg-[#1E90FF] hover:bg-[#1873CC] disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {locationStatus === 'checking'
                    ? 'Checking…'
                    : locationStatus === 'idle'
                    ? 'Check my location'
                    : 'Recheck'}
                </button>
              </div>

              {locationStatus === 'idle' && (
                <p className="text-xs text-gray-500">
                  Tap the button to automatically check if a £14 location surcharge applies to your address.
                </p>
              )}

              {locationStatus === 'checking' && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="inline-block w-3 h-3 border-2 border-[#1E90FF] border-t-transparent rounded-full animate-spin" />
                  Getting your location…
                </div>
              )}

              {locationStatus === 'no_surcharge' && drivingMinutes !== null && (
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-emerald-800">You're within our service area</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Estimated {drivingMinutes} min drive — no location surcharge applies.
                    </p>
                  </div>
                </div>
              )}

              {locationStatus === 'surcharge' && drivingMinutes !== null && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-800">Location surcharge applies</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Estimated {drivingMinutes} min drive — a £14 surcharge will be added to your booking.
                    </p>
                  </div>
                </div>
              )}

              {locationStatus === 'denied' && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">
                    Location access was denied. Please allow location access in your browser settings and try again.
                  </p>
                </div>
              )}

              {locationStatus === 'error' && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">
                    Couldn't get your location. Please try again or contact us if the issue persists.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            We'll use your information to confirm your booking and send you a reminder.
            Our detailer will visit the provided address at the scheduled time.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
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
          disabled={!allFieldsFilled || isSubmitting}
          className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white"
        >
          Next
        </Button>
      </div>
    </div>
  );
}