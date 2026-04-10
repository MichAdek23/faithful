import { useState } from 'react';
import { Mail, Search, Calendar, Clock, Sparkles, Car, Truck, Tag, CircleCheck as CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

interface Booking {
  id: string;
  booking_code: string;
  booking_date: string;
  booking_time: string;
  service_type: string;
  service_price: number;
  original_price?: number;
  vehicle_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  house_number?: string;
  street_name?: string;
  post_code?: string;
  city?: string;
  status: string;
  created_at: string;
  group_id?: string;
  vehicle_condition?: string;
  vehicle_details?: string;
  condition_fee?: number;
  location_surcharge?: number;
  same_day_fee?: number;
  discount_amount?: number;
  discount_type?: string;
}

export default function ViewBookingsPage() {
  useSEO({
    title: "View My Bookings",
    description:
      "Check the status of your car wash and detailing bookings with Faithful Auto Care. Look up your appointments using your email address.",
    canonical: "/view-bookings",
    keywords:
      "view car wash booking, check booking status, my appointments, Faithful Auto Care bookings, van valeting",
  });

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setBookings(data || []);
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getVehicleIcon = (vehicleType: string) => {
    return vehicleType === 'Van' ? Truck : Car;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'washed':
      case 'completed':
        return 'bg-blue-50 text-blue-700';
      case 'confirmed':
        return 'bg-green-50 text-green-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'washed':
        return 'Completed';
      case 'confirmed':
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Group bookings by group_id for multi-vehicle bookings
  const groupedBookings = bookings.reduce((acc, booking) => {
    if (booking.group_id) {
      if (!acc[booking.group_id]) {
        acc[booking.group_id] = [];
      }
      acc[booking.group_id].push(booking);
    } else {
      // For single bookings, use booking id as key
      acc[booking.id] = [booking];
    }
    return acc;
  }, {} as Record<string, Booking[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[#1E90FF] hover:text-[#1873CC] mb-4 text-sm font-medium"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">View My Bookings</h1>
          <p className="text-sm sm:text-base text-gray-600">Enter your email to see your booking history</p>
        </div>

        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full h-12 bg-[#1E90FF] hover:bg-[#1873CC] text-white"
            >
              {isLoading ? (
                'Searching...'
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Bookings
                </>
              )}
            </Button>
          </div>
        </Card>

        {hasSearched && !isLoading && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card className="p-6 sm:p-12 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
                    <p className="text-gray-600 mb-6">
                      We couldn't find any bookings associated with this email address.
                    </p>
                    <Button
                      onClick={() => navigate('/book-now')}
                      className="bg-[#1E90FF] hover:bg-[#1873CC] text-white"
                    >
                      Make Your First Booking
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Your Bookings ({bookings.length})
                  </h2>
                  <p className="text-xs text-gray-500">
                    {email}
                  </p>
                </div>

                {/* Display grouped bookings */}
                {Object.entries(groupedBookings).map(([groupId, groupBookings]) => {
                  const primaryBooking = groupBookings[0];
                  const isMultiVehicle = groupBookings.length > 1;
                  
                  return (
                    <Card key={groupId} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                      {/* Multi-vehicle indicator */}
                      {isMultiVehicle && (
                        <div className="mb-4 -mt-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Multi-Vehicle Booking ({groupBookings.length} vehicles)
                          </span>
                        </div>
                      )}

                      {/* Main booking header with code and status */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E90FF]" />
                            <span className="text-base sm:text-lg font-bold text-[#1E90FF]">
                              {primaryBooking.booking_code}
                            </span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(primaryBooking.status)}`}>
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {getStatusLabel(primaryBooking.status)}
                        </div>
                        {primaryBooking.discount_type && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {primaryBooking.discount_type === 'first_time' ? '🎉 First-time Discount' : '💰 Discount Applied'}
                          </span>
                        )}
                      </div>

                      {/* Date, Time, and Location */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(primaryBooking.booking_date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Time</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {primaryBooking.booking_time}
                            </p>
                          </div>
                        </div>

                        {primaryBooking.street_name && (
                          <div className="col-span-2 flex items-start gap-3">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div>
                              <p className="text-xs text-gray-500">Location</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {primaryBooking.house_number} {primaryBooking.street_name}, {primaryBooking.city}, {primaryBooking.post_code}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Services list */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Services:</p>
                        {groupBookings.map((booking, idx) => {
                          const VehicleIcon = getVehicleIcon(booking.vehicle_type);
                          
                          return (
                            <div key={booking.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                <VehicleIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-gray-900">
                                      {booking.vehicle_type} {groupBookings.length > 1 ? idx + 1 : ''}
                                    </span>
                                    {booking.vehicle_type === 'Van' && (
                                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                        Commercial
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {booking.service_type}
                                  </p>
                                  {booking.vehicle_details && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Details: {booking.vehicle_details}
                                    </p>
                                  )}
                                  {booking.vehicle_condition && booking.vehicle_condition !== 'mild' && (
                                    <p className="text-xs text-gray-500">
                                      Condition: {booking.vehicle_condition.replace('_', ' ')}
                                      {booking.condition_fee && booking.condition_fee > 0 && (
                                        <span className="text-emerald-600 ml-1">(+£{booking.condition_fee})</span>
                                      )}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">
                                    £{booking.service_price}
                                  </p>
                                  {booking.original_price && booking.original_price > booking.service_price && (
                                    <p className="text-xs text-gray-400 line-through">
                                      £{booking.original_price}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Price summary for multi-vehicle bookings */}
                      {isMultiVehicle && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Total:</span>
                            <span className="text-xl font-bold text-[#1E90FF]">
                              £{groupBookings.reduce((sum, b) => sum + (b.service_price || 0), 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Footer with created date */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Booked on {formatDate(primaryBooking.created_at)}
                        </p>
                        {!isMultiVehicle && (
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            £{primaryBooking.service_price}
                          </p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}