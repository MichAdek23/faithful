import { useState, useEffect } from 'react';
import { User, Mail, Phone, Info, MapPin, Chrome as Home, Building2, MapPinned, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../lib/supabase';

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

// Updated service areas - LONDON REMOVED
const SERVICE_AREA_PREFIXES = ['LU', 'MK', 'SG', 'AL', 'HP', 'WD', 'EN'];

function getPostcodePrefix(postcode: string): string {
  return postcode.trim().toUpperCase().replace(/\d.*$/, '').replace(/[^A-Z]/g, '');
}

function isInServiceArea(postcode: string): boolean {
  const prefix = getPostcodePrefix(postcode);
  
  // Check if prefix matches any service area
  return SERVICE_AREA_PREFIXES.some(areaPrefix => 
    prefix === areaPrefix || prefix.startsWith(areaPrefix)
  );
}

interface PostcodeLookupResult {
  postcode: string;
  city: string;
  town?: string;
  adminDistrict?: string;
  parish?: string;
  isValid: boolean;
  error?: string;
}

async function lookupPostcode(postcode: string): Promise<PostcodeLookupResult> {
  // Remove spaces and validate format
  const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase();
  
  try {
    // Using postcodes.io API
    const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
    const data = await response.json();
    
    if (data.status === 200 && data.result) {
      // Get the most appropriate location name (preferring town/city over administrative district)
      const locationName = data.result.postcode;
      
      return {
        postcode: data.result.postcode,
        city: data.result.admin_district || data.result.parish || data.result.admin_ward || '',
        town: data.result.parish || data.result.admin_ward || data.result.admin_district || '',
        adminDistrict: data.result.admin_district,
        parish: data.result.parish,
        isValid: true
      };
    } else {
      return {
        postcode: cleanPostcode,
        city: '',
        isValid: false,
        error: 'Invalid postcode'
      };
    }
  } catch (error) {
    console.error('Postcode lookup failed:', error);
    return {
      postcode: cleanPostcode,
      city: '',
      isValid: false,
      error: 'Failed to validate postcode'
    };
  }
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

  const [locationStatus, setLocationStatus] = useState<'idle' | 'in_area' | 'out_of_area'>('idle');
  const [distance, setDistance] = useState<number>(
    typeof distanceFromServiceArea === 'number' ? distanceFromServiceArea : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // Postcode validation states
  const [validatingPostcode, setValidatingPostcode] = useState(false);
  const [postcodeValid, setPostcodeValid] = useState(false);
  const [postcodeError, setPostcodeError] = useState('');
  const [lookedUpLocation, setLookedUpLocation] = useState<PostcodeLookupResult | null>(null);
  
  // Track if user has manually edited the city field
  const [cityManuallyEdited, setCityManuallyEdited] = useState(false);

  // Re-evaluate the surcharge whenever the postcode changes
  useEffect(() => {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode.replace(/\s/g, ''))) {
      setLocationStatus('idle');
      setPostcodeValid(false);
      setPostcodeError('');
      setLookedUpLocation(null);
      return;
    }
    
    // Validate postcode with API
    const validatePostcode = async () => {
      setValidatingPostcode(true);
      setPostcodeError('');
      
      const result = await lookupPostcode(postcode);
      
      if (result.isValid) {
        setPostcodeValid(true);
        setLookedUpLocation(result);
        
        // AUTO-SUGGEST LOCATION: Only auto-fill if user hasn't manually edited the city field
        if (!cityManuallyEdited && !town) {
          // Suggest a default value but don't force it
          const suggestedCity = result.town || result.city;
          if (suggestedCity) {
            setTown(suggestedCity);
            onDetailsChange({ city: suggestedCity });
          }
        }
      } else {
        setPostcodeValid(false);
        setPostcodeError(result.error || 'Invalid postcode');
        setLookedUpLocation(null);
      }
      
      setValidatingPostcode(false);
    };
    
    const timeout = setTimeout(validatePostcode, 800);
    return () => clearTimeout(timeout);
  }, [postcode]);

  // Check service area status
  useEffect(() => {
    if (postcodeValid && isInServiceArea(postcode)) {
      setLocationStatus('in_area');
      setDistance(0);
      onDetailsChange({ distanceFromServiceArea: 0 });
    } else if (postcodeValid && !isInServiceArea(postcode)) {
      setLocationStatus('out_of_area');
      setDistance(999);
      onDetailsChange({ distanceFromServiceArea: 999 });
    }
  }, [postcode, postcodeValid]);

  // Check first-time customer status
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

  const handleCityChange = (value: string) => {
    setCityManuallyEdited(true);
    setTown(value);
    onDetailsChange({ city: value });
  };

  const handleNext = () => {
    // Validate all fields
    if (!name || !email || !phone || !houseNum || !street || !postcode || !town) {
      setError('Please fill in all fields');
      return;
    }

    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode.replace(/\s/g, ''))) {
      setError('Please enter a valid UK postcode');
      return;
    }

    if (!postcodeValid) {
      setError('Please enter a valid postcode');
      return;
    }

    // Only show a warning, not an error, if city doesn't match the lookup
    // This makes it more user-friendly
    if (lookedUpLocation && cityManuallyEdited) {
      const suggestedCity = lookedUpLocation.town || lookedUpLocation.city;
      if (suggestedCity && town.toLowerCase() !== suggestedCity.toLowerCase()) {
        // Just show a confirmation dialog instead of blocking
        const confirmChange = window.confirm(
          `The town/city "${town}" doesn't match the postcode's expected location "${suggestedCity}". Do you want to continue with "${town}"?`
        );
        if (!confirmChange) {
          return;
        }
      }
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

  const allFieldsFilled = name && email && phone && houseNum && street && postcode && town && postcodeValid;

  // Get suggested location for display
  const suggestedLocation = lookedUpLocation 
    ? (lookedUpLocation.town || lookedUpLocation.city)
    : null;
  
  const showLocationSuggestion = suggestedLocation && 
                                 town && 
                                 cityManuallyEdited && 
                                 town.toLowerCase() !== suggestedLocation.toLowerCase();

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
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="SW1A 1AA"
                    value={postcode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setPostcode(val);
                      onDetailsChange({ postCode: val });
                    }}
                    className={`h-12 ${validatingPostcode ? 'pr-10' : ''} ${
                      postcodeError ? 'border-red-300 focus:ring-red-500' : ''
                    }`}
                  />
                  {validatingPostcode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Postcode validation messages */}
                {postcodeError && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    <p className="text-xs text-red-600 font-medium">{postcodeError}</p>
                  </div>
                )}

                {postcodeValid && !postcodeError && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-600 font-medium">Valid postcode</p>
                  </div>
                )}

                {/* Surcharge indicators */}
                {locationStatus === 'in_area' && postcodeValid && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium">
                      Within service area — no surcharge
                    </p>
                  </div>
                )}
                {locationStatus === 'out_of_area' && postcodeValid && (
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
                  placeholder="e.g., London, Manchester, Birmingham"
                  value={town}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="h-12"
                />
                
                {/* Helpful suggestion when city doesn't match postcode */}
                {showLocationSuggestion && (
                  <div className="flex items-start gap-1.5 mt-2 p-2 bg-blue-50 rounded-md">
                    <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-700">
                        This postcode is typically associated with "{suggestedLocation}".
                      </p>
                      <button
                        onClick={() => {
                          setTown(suggestedLocation);
                          onDetailsChange({ city: suggestedLocation });
                          setCityManuallyEdited(false);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                      >
                        Use "{suggestedLocation}" instead
                      </button>
                    </div>
                  </div>
                )}

                {/* Helper text */}
                {postcodeValid && !showLocationSuggestion && town && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-600 font-medium">
                      ✓ Town/City entered
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Service area info banner - London Removed */}
            <div className="rounded-xl border border-gray-200 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E90FF]" />
                <span className="text-sm font-medium text-gray-700">Service area coverage</span>
              </div>
              <p className="text-xs text-gray-500">
                We cover <span className="font-medium text-gray-700">LU, MK, SG, AL, HP, WD, EN</span> postcode areas at no extra charge.
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