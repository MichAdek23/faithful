import { useState, useEffect } from 'react';
import { Droplet, Sparkles, Gem, Plus, Trash2, Calendar, Star, Tag, Percent, CreditCard, CircleCheck as CheckCircle, Info, Truck } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../lib/supabase';
import type { CarEntry, BookingData } from '../../pages/BookingPage';

interface ServiceStepProps {
  cars: CarEntry[];
  onCarsChange: (cars: CarEntry[]) => void;
  onNext: (bookingId: string, discountInfo?: DiscountInfo) => void;
  onBack: () => void;
  userEmail?: string;
  userPhone?: string;
  bookingData: BookingData;
  sameDayFee?: number;
}

interface DiscountInfo {
  isFirstTime: boolean;
  firstTimeDiscount: number;
  multiCarDiscount: number;
  originalTotal: number;
  finalTotal: number;
  conditionFees?: number;
  locationSurcharge?: number;
  sameDayFee?: number;
}

// Car services
const carServices = [
  {
    name: 'Basic Package – £15',
    displayName: 'Basic Package',
    icon: Droplet,
    description: 'A quick and affordable refresh. Interior OR Exterior clean (not both). Includes paint protection sealant.',
    duration: '1 - 1.5 hrs',
    price: 15,
    features: ['Interior OR Exterior clean', 'Paint protection sealant', 'Regular upkeep ideal'],
    vehicleCategory: 'car'
  },
  {
    name: 'Standard Package – £32',
    displayName: 'Standard Package',
    icon: Sparkles,
    description: 'A complete inside-and-out clean. Full interior and exterior cleaning with dashboard wipe, vacuum, and windows.',
    duration: '3 hrs',
    price: 32,
    features: ['Full interior & exterior', 'Dashboard wipe', 'Vacuum & windows', 'No deep seat cleaning'],
    vehicleCategory: 'car'
  },
  {
    name: 'Premium Package – £45',
    displayName: 'Premium Package',
    icon: Star,
    description: 'Enhanced detailing with paint protection. Everything in Standard plus protective sealant.',
    duration: '3 hrs',
    price: 45,
    features: ['Everything in Standard', 'Paint protection sealant', 'Preserves paint finish'],
    vehicleCategory: 'car'
  },
  {
    name: 'Ultimate Package – £80',
    displayName: 'Ultimate Package',
    icon: Gem,
    description: 'Top-tier intensive detailing. Deep cleaning of all surfaces with stain remover treatment.',
    duration: '4 - 4.5 hrs',
    price: 80,
    features: ['Everything in Premium', 'Deep surface cleaning', 'Alloy wheels & windows', 'Stain remover treatment'],
    vehicleCategory: 'car'
  },
  {
    name: 'Maintenance Plan – £40/month',
    displayName: 'Maintenance Plan',
    icon: Calendar,
    description: 'Monthly subscription to keep your car consistently clean and protected all year round.',
    duration: 'Monthly',
    price: 40,
    features: ['Everything in Premium', 'Monthly service', 'Alloy wheel care', 'Requires 1 Premium first'],
    isSubscription: true,
    vehicleCategory: 'car'
  }
];

// Van services (hardcoded)
const vanServices = [
  {
    name: 'Small Van – £50',
    displayName: 'Small Van Package',
    icon: Truck,
    description: 'Perfect for compact vans and small commercial vehicles',
    price: 50,
    features: [
      'Full exterior wash and hand dry',
      'Interior vacuum and deep clean',
      'Dashboard and console cleaning',
      'Window cleaning inside and out',
      'Door jambs and hinges cleaned',
      'Tyre dressing and wheel cleaning'
    ],
    vehicleCategory: 'van'
  },
  {
    name: 'Medium Van – £65',
    displayName: 'Medium Van Package',
    icon: Truck,
    description: 'Ideal for standard transit vans and medium commercial vehicles',
    price: 65,
    features: [
      'Full exterior wash and hand dry',
      'Interior vacuum and deep clean',
      'Dashboard and console cleaning',
      'Window cleaning inside and out',
      'Door jambs and hinges cleaned',
      'Tyre dressing and wheel cleaning'
    ],
    vehicleCategory: 'van'
  },
  {
    name: 'Large Van – £80',
    displayName: 'Large Van Package',
    icon: Truck,
    description: 'Comprehensive service for large vans and high-roof vehicles',
    price: 80,
    features: [
      'Full exterior wash and hand dry',
      'Interior vacuum and deep clean',
      'Dashboard and console cleaning',
      'Window cleaning inside and out',
      'Door jambs and hinges cleaned',
      'Tyre dressing and wheel cleaning'
    ],
    vehicleCategory: 'van'
  }
];

// All services combined
const allServices = [...carServices, ...vanServices];

// Get price based on service name
const getPrice = (serviceName: string): number => {
  const service = allServices.find(s => s.name === serviceName);
  return service?.price || 0;
};

// Get services by vehicle type
const getServicesByVehicleType = (vehicleType: string) => {
  if (vehicleType === 'Van') {
    return vanServices;
  }
  return carServices;
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const generateBookingCode = (): string => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const hasRecentPremiumService = async (email?: string, phone?: string): Promise<boolean> => {
  if (!email && !phone) return false;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let query = supabase
    .from('bookings')
    .select('id')
    .ilike('service_type', 'Premium Package%')
    .gte('booking_date', thirtyDaysAgo.toISOString().split('T')[0])
    .limit(1);

  if (email && phone) {
    query = query.or(`customer_email.eq.${email},customer_phone.eq.${phone}`);
  } else if (email) {
    query = query.eq('customer_email', email);
  } else {
    query = query.eq('customer_phone', phone!);
  }

  const { data } = await query;
  return !!(data && data.length > 0);
};

function calculateDiscounts(
  cars: CarEntry[],
  isFirstTime: boolean,
  locationSurcharge: number = 0,
  sameDayFee: number = 0
): DiscountInfo {
  const baseAndCondition = cars.reduce((sum, c) => {
    const conditionFee = c.conditionFee ?? 0;
    return sum + c.servicePrice + conditionFee;
  }, 0);
  const originalTotal = baseAndCondition + locationSurcharge + sameDayFee;
  const multiCarDiscount = 0;
  let firstTimeDiscount = 0;
  if (isFirstTime && originalTotal > 0) {
    firstTimeDiscount = Math.round(originalTotal * 0.15 * 100) / 100;
  }
  const finalTotal = Math.max(0, originalTotal - firstTimeDiscount);
  const conditionFees = cars.reduce((sum, c) => sum + (c.conditionFee ?? 0), 0);
  return {
    isFirstTime,
    firstTimeDiscount,
    multiCarDiscount,
    originalTotal,
    finalTotal,
    conditionFees,
    locationSurcharge,
    sameDayFee,
  };
}

export function ServiceStep({ 
  cars, 
  onCarsChange, 
  onNext, 
  onBack, 
  userEmail, 
  userPhone,
  bookingData,
  sameDayFee = 0
}: ServiceStepProps) {
  const [localCars, setLocalCars] = useState<CarEntry[]>(() => {
    if (cars.length > 0) return cars;
    return [
      {
        id: generateId(),
        serviceType: '',
        servicePrice: 0,
        vehicleType: 'Car',
        vehicleDetails: '',
        vehicleCondition: 'mild',
        conditionFee: 0,
        locationSurcharge: undefined,
      },
    ];
  });
  const [expandedCarIndex, setExpandedCarIndex] = useState(
    cars.length > 0 && cars.every(c => c.serviceType) ? -1 : 0
  );
  const [maintenancePlanWarning, setMaintenancePlanWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);

  useEffect(() => {
    if (userEmail) {
      const checkFirstTime = async () => {
        const { count } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('customer_email', userEmail);
        setIsFirstTime(count === 0);
      };
      checkFirstTime();
    }
  }, [userEmail]);

  const updateCar = (index: number, updates: Partial<CarEntry>) => {
    const updated = localCars.map((car, i) => 
      i === index ? { ...car, ...updates } : car
    );
    
    // If vehicle type changes, reset service selection
    if (updates.vehicleType && updates.vehicleType !== localCars[index].vehicleType) {
      updated[index].serviceType = '';
      updated[index].servicePrice = 0;
    }
    
    setLocalCars(updated);
    onCarsChange(updated);
  };

  const addCar = () => {
    const newCar: CarEntry = {
      id: generateId(),
      serviceType: '',
      servicePrice: 0,
      vehicleType: 'Car',
      vehicleDetails: '',
      vehicleCondition: 'mild',
      conditionFee: 0,
      locationSurcharge: undefined,
    };
    const updated = [...localCars, newCar];
    setLocalCars(updated);
    onCarsChange(updated);
    setExpandedCarIndex(updated.length - 1);
  };

  const removeCar = (index: number) => {
    const updated = localCars.filter((_, i) => i !== index);
    setLocalCars(updated);
    onCarsChange(updated);
    if (expandedCarIndex === index) {
      setExpandedCarIndex(updated.length > 0 ? 0 : -1);
    } else if (expandedCarIndex > index) {
      setExpandedCarIndex(expandedCarIndex - 1);
    }
  };

  const handleServiceSelect = async (index: number, serviceName: string) => {
    const price = getPrice(serviceName);
    
    if (serviceName === 'Maintenance Plan – £45/month') {
      const hasPremium = await hasRecentPremiumService(userEmail, userPhone);
      if (!hasPremium) {
        setMaintenancePlanWarning('You need to have completed a Premium Package in the last 30 days to join the Maintenance Plan.');
        return;
      } else {
        setMaintenancePlanWarning(null);
      }
    }
    
    updateCar(index, { serviceType: serviceName, servicePrice: price });
  };

  const allCarsComplete = localCars.length > 0 && localCars.every(
    (car) => car.serviceType && car.servicePrice > 0
  );

  const distanceValue = (bookingData as any).distanceFromServiceArea;
  let locationSurcharge = 0;
  if (typeof distanceValue === 'number' && distanceValue > 5) {
    locationSurcharge = 14;
  }

  const discount = calculateDiscounts(localCars, isFirstTime, locationSurcharge, sameDayFee);

  const handleConfirmBooking = async () => {
    if (!allCarsComplete) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const { data: bookingCount, error: countError } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('booking_date', bookingData.date)
        .eq('booking_time', bookingData.time);

      if (countError) throw countError;

      const count = bookingCount as unknown as { count: number } | null;
      if (count && count.count >= 3) {
        setError('This time slot is now full. Please go back and select a different time.');
        setIsSubmitting(false);
        return;
      }

      const groupId = crypto.randomUUID();
      const primaryBookingCode = generateBookingCode();

      const bookingRows = localCars.map((car, index) => {
        const basePrice = car.servicePrice + (car.conditionFee ?? 0);
        const originalPrice = basePrice + locationSurcharge + sameDayFee;
        let discountAmount = 0;
        let discountType: string | null = null;
        if (isFirstTime && originalPrice > 0) {
          discountAmount = Math.round(originalPrice * 0.15 * 100) / 100;
          discountType = 'first_time';
        }
        const finalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);
        return {
          booking_code: index === 0 ? primaryBookingCode : generateBookingCode(),
          group_id: localCars.length > 1 ? groupId : null,
          booking_date: bookingData.date,
          booking_time: bookingData.time,
          service_type: car.serviceType,
          original_price: originalPrice,
          service_price: finalPrice,
          vehicle_type: car.vehicleType,
          customer_name: bookingData.customerName,
          customer_email: bookingData.customerEmail,
          customer_phone: bookingData.customerPhone,
          house_number: bookingData.houseNumber,
          street_name: bookingData.streetName,
          post_code: bookingData.postCode,
          city: bookingData.city,
          status: 'pending',
          discount_amount: discountAmount,
          discount_type: discountType,
          vehicle_condition: car.vehicleCondition ?? '',
          vehicle_details: car.vehicleDetails ?? '',
          condition_fee: car.conditionFee ?? 0,
          location_surcharge: locationSurcharge,
          same_day_fee: sameDayFee,
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
        const carSummary = localCars.length === 1
          ? `${localCars[0].serviceType} for ${localCars[0].vehicleType}`
          : `${localCars.length} vehicles (${localCars.map(c => c.vehicleType).join(', ')})`;

        const { data: activeAdmins } = await supabase
          .from('admins')
          .select('id')
          .eq('is_active', true);

        if (activeAdmins && activeAdmins.length > 0) {
          await supabase.from('notifications').insert(
            activeAdmins.map((admin) => ({
              title: 'New Booking Received',
              message: `${bookingData.customerName} booked ${carSummary} on ${bookingData.date} at ${bookingData.time}`,
              type: 'booking',
              booking_id: primaryBooking.id,
              is_read: false,
              admin_id: admin.id,
            }))
          );
        }
      }

      const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
      const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            booking_id: primaryBookingCode,
            customer_name: bookingData.customerName,
            customer_email: bookingData.customerEmail,
            customer_phone: bookingData.customerPhone,
            house_number: bookingData.houseNumber,
            street_name: bookingData.streetName,
            post_code: bookingData.postCode,
            city: bookingData.city,
            booking_date: bookingData.date,
            booking_time: bookingData.time,
            service_type: localCars.length === 1 ? localCars[0].serviceType : `${localCars.length} Vehicles`,
            service_price: discount.finalTotal,
            vehicle_type: localCars.length === 1 ? localCars[0].vehicleType : localCars.map(c => c.vehicleType).join(', '),
            cars: localCars.map(c => ({
              serviceType: c.serviceType,
              vehicleType: c.vehicleType,
              servicePrice: c.servicePrice,
              conditionFee: c.conditionFee,
              vehicleCondition: c.vehicleCondition,
            })),
            discount_info: {
              is_first_time: isFirstTime,
              first_time_discount: discount.firstTimeDiscount,
              multi_car_discount: discount.multiCarDiscount,
              original_total: discount.originalTotal,
              final_total: discount.finalTotal,
              condition_fees: discount.conditionFees,
              location_surcharge: discount.locationSurcharge,
              same_day_fee: discount.sameDayFee,
            },
          }),
        }).catch(err => console.error('Email send failed:', err));
      }

      onNext(primaryBookingCode, discount);
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasMaintenancePlan = localCars.some(car => car.serviceType === 'Maintenance Plan – £45/month');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-semibold text-gray-900">Choose Your Service</h3>
      </div>

      {sameDayFee > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-amber-100 rounded-full p-2">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-amber-800">⚠️ Same-Day Booking Fee Applied</p>
              <p className="text-sm text-amber-700 mt-1">
                You're booking for <span className="font-semibold underline">{bookingData.date}</span> (today)! 
                An additional <span className="font-bold text-lg">£{sameDayFee}</span> same-day booking fee has been added to your total.
              </p>
              <p className="text-xs text-amber-600 mt-2">
                This fee covers the priority handling of your same-day service request.
              </p>
            </div>
          </div>
        </div>
      )}

      {maintenancePlanWarning && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs text-red-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{maintenancePlanWarning}</span>
          </p>
        </div>
      )}

      {hasMaintenancePlan && !maintenancePlanWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Maintenance Plan requires one Premium Package completion before joining. Please ensure you've had a Premium service previously.</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {localCars.map((car, index) => {
          const isExpanded = expandedCarIndex === index;
          const isComplete = car.serviceType && car.servicePrice > 0;

          return (
            <div key={car.id} className="border-2 border-gray-200 rounded-xl overflow-hidden transition-all">
              <button
                onClick={() => setExpandedCarIndex(isExpanded ? -1 : index)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isComplete ? 'bg-[#1E90FF] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">
                      {car.vehicleType} {index + 1}
                      {isComplete && ` - ${car.serviceType?.replace(` – £${car.servicePrice}`, '')}`}
                    </p>
                    {isComplete && (
                      <p className="text-xs text-[#1E90FF] font-semibold">
                        {car.serviceType?.includes('month') ? `£${car.servicePrice}/month` : `£${car.servicePrice}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {localCars.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCar(index);
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div>
                  {/* Vehicle Type Selection */}
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Info className="w-4 h-4" />
                      Select Vehicle Type
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateCar(index, { vehicleType: 'Car' })}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          car.vehicleType === 'Car'
                            ? 'border-[#1E90FF] bg-blue-50 text-[#1E90FF] font-medium'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        🚗 Car
                      </button>
                      <button
                        onClick={() => updateCar(index, { vehicleType: 'Van' })}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                          car.vehicleType === 'Van'
                            ? 'border-[#1E90FF] bg-blue-50 text-[#1E90FF] font-medium'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        🚐 Van
                      </button>
                    </div>
                  </div>

                  {/* Service Selection based on Vehicle Type */}
                  <CarServiceSelector
                    car={car}
                    onServiceSelect={(serviceName) => handleServiceSelect(index, serviceName)}
                    onClose={() => setExpandedCarIndex(-1)}
                    services={getServicesByVehicleType(car.vehicleType)}
                    vehicleType={car.vehicleType}
                  />

                  {/* Vehicle Details & Condition */}
                  <div className="p-4 sm:p-6 space-y-4 border-t border-gray-200">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Info className="w-4 h-4" />
                        Vehicle details
                      </label>
                      <Input
                        type="text"
                        placeholder={car.vehicleType === 'Van' ? "e.g. Ford Transit, white" : "e.g. BMW 3 Series, red"}
                        value={car.vehicleDetails || ''}
                        onChange={(e) => updateCar(index, { vehicleDetails: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Droplet className="w-4 h-4" />
                        Vehicle condition
                      </label>
                      <select
                        value={car.vehicleCondition || 'mild'}
                        onChange={(e) => {
                          const val = e.target.value;
                          let fee = 0;
                          if (val === 'medium') fee = car.vehicleType === 'Van' ? 5 : 3;
                          if (val === 'very_dirty') fee = car.vehicleType === 'Van' ? 8 : 5;
                          updateCar(index, { vehicleCondition: val, conditionFee: fee });
                        }}
                        className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-700 bg-white"
                      >
                        <option value="mild">Mild (no extra)</option>
                        <option value="medium">
                          Medium (+£{car.vehicleType === 'Van' ? '5' : '3'})
                        </option>
                        <option value="very_dirty">
                          Very dirty (+£{car.vehicleType === 'Van' ? '8' : '5'})
                        </option>
                      </select>
                      {car.vehicleCondition === 'medium' && (
                        <p className="text-xs text-emerald-600 mt-1">
                          A £{car.vehicleType === 'Van' ? '5' : '3'} surcharge will be applied
                        </p>
                      )}
                      {car.vehicleCondition === 'very_dirty' && (
                        <p className="text-xs text-emerald-600 mt-1">
                          A £{car.vehicleType === 'Van' ? '8' : '5'} surcharge will be applied
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addCar}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#1E90FF] hover:text-[#1E90FF] hover:bg-blue-50/50 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium text-sm">Add Another Vehicle</span>
      </button>

      {/* Booking Summary - Rest remains the same */}
      {allCarsComplete && (
        <div className="border-t pt-6 mt-4">
          <div className="bg-gray-50 rounded-lg p-5">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1E90FF]" />
              Booking Summary
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{bookingData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{bookingData.postCode}, {bookingData.city}</span>
              </div>

              <div className="border-t pt-3 mt-3 space-y-2">
                <p className="font-medium text-gray-700">Services Selected:</p>
                {localCars.map((car, i) => {
                  const perCarTotal = car.servicePrice + (car.conditionFee ?? 0);
                  return (
                    <div key={car.id} className="flex justify-between items-center pl-2">
                      <span className="text-gray-600 text-xs sm:text-sm">
                        {car.vehicleType} {i + 1}: {car.serviceType?.replace(` – £${car.servicePrice}`, '')}
                        {car.vehicleCondition && car.vehicleCondition !== 'mild' && (
                          <span className="ml-1 text-emerald-600">– {car.vehicleCondition.replace('_', ' ')}</span>
                        )}
                      </span>
                      <span className="font-medium">
                        £{perCarTotal.toFixed(2)}
                        {car.serviceType?.includes('month') && '/mo'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-3 mt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">£{(discount.originalTotal - (discount.sameDayFee || 0) - (discount.locationSurcharge || 0)).toFixed(2)}</span>
                </div>

                {discount.conditionFees && discount.conditionFees > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Condition fees:
                    </span>
                    <span className="font-medium">+£{discount.conditionFees.toFixed(2)}</span>
                  </div>
                )}

                {discount.locationSurcharge && discount.locationSurcharge > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Location surcharge:
                    </span>
                    <span className="font-medium">+£{discount.locationSurcharge.toFixed(2)}</span>
                  </div>
                )}

                {discount.sameDayFee && discount.sameDayFee > 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Same-day booking fee:
                    </span>
                    <span className="font-medium">+£{discount.sameDayFee.toFixed(2)}</span>
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

                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-900 font-semibold">Total to Pay:</span>
                  <span className="font-bold text-xl text-[#1E90FF]">£{discount.finalTotal.toFixed(2)}</span>
                </div>
                
                {localCars.some(car => car.serviceType?.includes('month')) && (
                  <p className="text-xs text-gray-500 text-right mt-1">* Monthly subscription prices shown are per month</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              By confirming this booking, you agree to our terms of service. We'll send a confirmation email to {userEmail} with all the details.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 text-gray-700 border-gray-300"
          disabled={isSubmitting}
        >
          Back
        </Button>
        {!allCarsComplete ? (
          <Button
            disabled
            className="flex-1 h-12 bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Select Services First
          </Button>
        ) : (
          <Button
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="flex-1 h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white font-semibold"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Updated CarServiceSelector to accept dynamic services
function CarServiceSelector({
  car,
  onServiceSelect,
  onClose,
  services,
  vehicleType,
}: {
  car: CarEntry;
  onServiceSelect: (serviceName: string) => void;
  onClose: () => void;
  services: typeof carServices;
  vehicleType: string;
}) {
  const handleServiceClick = (serviceName: string) => {
    onServiceSelect(serviceName);
    onClose();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h4 className="font-medium text-gray-900">
        Select {vehicleType} Service Package
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = car.serviceType === service.name;

          return (
            <button
              key={service.name}
              onClick={() => handleServiceClick(service.name)}
              className={`
                p-4 rounded-xl border-2 transition-all text-left relative
                ${isSelected ? 'border-[#1E90FF] bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-[#1E90FF] hover:shadow-md'}
                ${service.isSubscription ? 'bg-gradient-to-br from-purple-50 to-white' : ''}
              `}
            >
              {service.isSubscription && (
                <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  Monthly
                </span>
              )}
              <div className="flex flex-col items-center text-center space-y-2">
                <Icon className={`w-8 h-8 ${isSelected ? 'text-[#1E90FF]' : 'text-gray-600'}`} />
                <div className="space-y-1">
                  <h4 className={`font-semibold text-xs sm:text-sm ${isSelected ? 'text-[#1E90FF]' : 'text-gray-900'}`}>
                    {service.displayName}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                  <p className="text-xs font-medium text-[#1E90FF]">
                    {service.isSubscription ? `£${service.price}/month` : `£${service.price}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {service.duration}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 italic">
                    {service.features[0]}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {car.serviceType === 'Maintenance Plan – £45/month' && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
          Note: One Premium Package must be completed before joining the Maintenance Plan.
        </p>
      )}
      {car.serviceType === 'Basic Package – £25' && (
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
          Choose interior OR exterior cleaning (not both). Paint protection sealant included with exterior.
        </p>
      )}
    </div>
  );
}