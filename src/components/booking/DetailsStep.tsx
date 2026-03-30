import { useState, useEffect } from 'react';
import { User, Mail, Phone, Info, MapPin, Chrome as Home, Building2, MapPinned, Car, Fuel, Calendar, Paintbrush, AlertTriangle } from 'lucide-react';
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
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  vehicleRegistration?: string;
  onDetailsChange: (data: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    houseNumber?: string;
    streetName?: string;
    postCode?: string;
    city?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleColor?: string;
    vehicleRegistration?: string;
    dirtinessLevel?: string;
    travelFee?: number;
  }) => void;
  onNext: () => void;
  onBack: () => void;
  bookingData: BookingData;
}

type DirtinessLevel = 'mild' | 'medium' | 'very';

export function DetailsStep({
  customerName,
  customerEmail,
  customerPhone,
  houseNumber,
  streetName,
  postCode,
  city,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  vehicleColor,
  vehicleRegistration,
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
  const [make, setMake] = useState(vehicleMake || '');
  const [model, setModel] = useState(vehicleModel || '');
  const [year, setYear] = useState(vehicleYear || '');
  const [color, setColor] = useState(vehicleColor || '');
  const [registration, setRegistration] = useState(vehicleRegistration || '');
  const [dirtinessLevel, setDirtinessLevel] = useState<DirtinessLevel>('mild');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingAddress, setCheckingAddress] = useState(false);
  const [travelFee, setTravelFee] = useState<number>(0);
  const [addressWarning, setAddressWarning] = useState<string>('');

  useEffect(() => {
    if (!email) {
      setIsFirstTime(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    const timeout = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const { count } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('customer_email', email);
        setIsFirstTime(count === 0);
      } catch (err) {
        console.error('Error checking email:', err);
      } finally {
        setCheckingEmail(false);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [email]);

  // Function to check if address is within service area and calculate travel fee
  const checkAddressDistance = async (postcodeValue: string, cityValue: string) => {
    if (!postcodeValue || !cityValue) return;

    setCheckingAddress(true);
    setAddressWarning('');
    
    try {
      // Define service area centers (Bedfordshire, Hertfordshire & Surrounding Areas)
      const serviceAreas = [
        { name: 'Bedfordshire', lat: 52.0902, lng: -0.4149 },
        { name: 'Hertfordshire', lat: 51.8086, lng: -0.2367 },
        { name: 'Luton', lat: 51.8787, lng: -0.4200 },
        { name: 'Stevenage', lat: 51.9038, lng: -0.1966 },
        { name: 'Watford', lat: 51.6565, lng: -0.3903 },
        { name: 'St Albans', lat: 51.7527, lng: -0.3396 }
      ];

      // Geocode the address using OpenStreetMap Nominatim API
      const fullAddress = `${postcodeValue}, ${cityValue}, UK`;
      const encodedAddress = encodeURIComponent(fullAddress);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'CarDetailingBooking/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const userLat = parseFloat(data[0].lat);
        const userLng = parseFloat(data[0].lon);
        
        // Calculate distance to the nearest service area
        let minDistance = Infinity;
        
        for (const area of serviceAreas) {
          const distance = calculateDistance(userLat, userLng, area.lat, area.lng);
          minDistance = Math.min(minDistance, distance);
        }
        
        // Convert distance to miles (Haversine formula returns km)
        const distanceInMiles = minDistance * 0.621371;
        
        // If distance is more than 5 minutes drive (~5 miles at average speed)
        if (distanceInMiles > 5) {
          setTravelFee(14);
          setAddressWarning(`Your location is ${distanceInMiles.toFixed(1)} miles from our service area. A £14 travel fee applies.`);
        } else {
          setTravelFee(0);
        }
      } else {
        setAddressWarning('Could not verify address. Travel fee may apply if outside service area.');
      }
    } catch (err) {
      console.error('Error checking address:', err);
      setAddressWarning('Unable to verify address. We will confirm service availability.');
    } finally {
      setCheckingAddress(false);
    }
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Trigger address check when postcode or city changes
  useEffect(() => {
    if (postcode && town) {
      const timeout = setTimeout(() => {
        checkAddressDistance(postcode, town);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [postcode, town]);

  // Calculate dirtiness fee
  const getDirtinessFee = (level: DirtinessLevel): number => {
    switch (level) {
      case 'medium':
        return 3;
      case 'very':
        return 5;
      default:
        return 0;
    }
  };

  const handleDirtinessChange = (level: DirtinessLevel) => {
    setDirtinessLevel(level);
    onDetailsChange({ 
      dirtinessLevel: level,
      travelFee: travelFee
    });
  };

  const handleNext = () => {
    if (!name || !email || !phone || !houseNum || !street || !postcode || !town || 
        !make || !model || !year || !color || !registration) {
      setError('Please fill in all fields');
      return;
    }

    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(postcode.replace(/\s/g, ''))) {
      setError('Please enter a valid UK postcode');
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      setError(`Please enter a valid year between 1900 and ${currentYear + 1}`);
      return;
    }

    const regRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{3}$|^[A-Z]{2}[0-9]{2}[A-Z]{2}$|^[A-Z][0-9]{2}[A-Z]{3}$/i;
    if (!regRegex.test(registration.toUpperCase().replace(/\s/g, ''))) {
      setError('Please enter a valid UK vehicle registration');
      return;
    }

    // Save all details and move to next step
    onDetailsChange({
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      houseNumber: houseNum,
      streetName: street,
      postCode: postcode,
      city: town,
      vehicleMake: make,
      vehicleModel: model,
      vehicleYear: year,
      vehicleColor: color,
      vehicleRegistration: registration,
      dirtinessLevel: dirtinessLevel,
      travelFee: travelFee
    });
    
    onNext();
  };

  const allFieldsFilled = name && email && phone && houseNum && street && postcode && town && 
                          make && model && year && color && registration;

  const dirtinessFee = getDirtinessFee(dirtinessLevel);
  const totalAdditionalFees = travelFee + dirtinessFee;

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
          <h4 className="text-lg font-medium text-gray-900 mb-4">Vehicle Details</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Car className="w-4 h-4" />
                  Make
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Toyota, BMW, Ford"
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value);
                    onDetailsChange({ vehicleMake: e.target.value });
                  }}
                  className="h-12"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Car className="w-4 h-4" />
                  Model
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Camry, 3 Series, Focus"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    onDetailsChange({ vehicleModel: e.target.value });
                  }}
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  Year
                </label>
                <Input
                  type="text"
                  placeholder="e.g., 2020"
                  value={year}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setYear(val);
                    onDetailsChange({ vehicleYear: val });
                  }}
                  maxLength={4}
                  className="h-12"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Paintbrush className="w-4 h-4" />
                  Color
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Black, White, Silver"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    onDetailsChange({ vehicleColor: e.target.value });
                  }}
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Fuel className="w-4 h-4" />
                Registration Number
              </label>
              <Input
                type="text"
                placeholder="AB12 CDE"
                value={registration}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setRegistration(val);
                  onDetailsChange({ vehicleRegistration: val });
                }}
                className="h-12"
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps our detailer identify your vehicle on the day
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Vehicle Condition</h4>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="w-4 h-4" />
                How dirty is your vehicle?
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleDirtinessChange('mild')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    dirtinessLevel === 'mild'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Mild</p>
                  <p className="text-xs text-gray-500 mt-1">No extra charge</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirtinessChange('medium')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    dirtinessLevel === 'medium'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Medium</p>
                  <p className="text-xs text-gray-500 mt-1">+£3</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirtinessChange('very')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    dirtinessLevel === 'very'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">Very Dirty</p>
                  <p className="text-xs text-gray-500 mt-1">+£5</p>
                </button>
              </div>
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

            {checkingAddress && (
              <p className="text-xs text-gray-500">Checking service availability...</p>
            )}
            
            {addressWarning && !checkingAddress && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">{addressWarning}</p>
              </div>
            )}
          </div>
        </div>

        {totalAdditionalFees > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Additional Charges</h5>
            <div className="space-y-1 text-sm">
              {travelFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Travel Fee:</span>
                  <span className="font-medium">£{travelFee}</span>
                </div>
              )}
              {dirtinessFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle Condition Fee ({dirtinessLevel}):</span>
                  <span className="font-medium">£{dirtinessFee}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                <span className="font-medium text-gray-900">Total Additional:</span>
                <span className="font-bold text-blue-600">£{totalAdditionalFees}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            We'll use your information to confirm your booking and send you a reminder.
            Our detailer will visit the provided address at the scheduled time and will
            need to identify your vehicle by its registration number.
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