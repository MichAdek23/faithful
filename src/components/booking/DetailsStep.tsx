import { useState, useEffect } from 'react';
import { User, Mail, Phone, Info, MapPin, Chrome as Home, Building2, MapPinned, CheckCircle, AlertTriangle } from 'lucide-react';
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

/**
 * Postcode area prefixes covered by the standard service area.
 * Customers with a postcode starting with any of these prefixes will
 * NOT be charged a location surcharge.
 */
const SERVICE_AREA_PREFIXES = ['LU', 'MK', 'SG', 'AL', 'HP', 'WD', 'EN'];

/**
 * Extracts the postcode area prefix (the leading letters) from a UK postcode.
 * e.g. "LU2 7FH" -> "LU", "SW1A 1AA" -> "SW"
 */
function getPostcodePrefix(postcode: string): string {
  return postcode.trim().toUpperCase().replace(/\d.*$/, '').replace(/[^A-Z]/g, '');
}

/**
 * Returns true if the postcode falls within the no-surcharge service area.
 */
function isInServiceArea(postcode: string): boolean {
  const prefix = getPostcodePrefix(postcode);
  return SERVICE_AREA_PREFIXES.includes(prefix);
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

  // Location surcharge status derived from the postcode as the user types
  // 'idle' = postcode not yet valid, 'in_area' = no surcharge, 'out_of_area' = surcharge applies
  const [locationStatus, setLocationStatus] = useState<'idle' | 'in_area' | 'out_of_area'>('idle');

  const [distance, setDistance] = useState<number>(
    typeof distanceFromServiceArea === 'number' ? distanceFromServiceArea : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // Re-evaluate the surcharge whenever the postcode changes
  useEffect(() => {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode.replace(/\s/g, ''))) {
      setLocationStatus('idle');
      return;
    }
    if (isInServiceArea(postcode)) {
      setLocationStatus('in_area');
      // Zero out any previously set surcharge distance
      setDistance(0);
      onDetailsChange({ distanceFromServiceArea: 0 });
    } else {
      setLocationStatus('out_of_area');
      // Use 999 as a sentinel value — ServiceStep checks > 5 to apply the £14 fee
      setDistance(999);
      onDetailsChange({ distanceFromServiceArea: 999 });
    }
  }, [postcode]);

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

                {/* Postcode area surcharge indicator — updates as user types */}
                {locationStatus === 'in_area' && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium">
                      Within service area — no surcharge
                    </p>
                  </div>
                )}
                {locationStatus === 'out_of_area' && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">
                      Outside service area — £14 surcharge applies
                    </p>
                  </div>
                )}
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

            {/* Service area info banner */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E90FF]" />
                <span className="text-sm font-medium text-gray-700">Service area coverage</span>
              </div>
              <p className="text-xs text-gray-500">
                We cover <span className="font-medium text-gray-700">LU, MK, SG, AL, HP, WD and EN</span> postcode areas at no extra charge.
                Bookings outside these areas incur a £14 surcharge, applied automatically based on your postcode.
              </p>
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