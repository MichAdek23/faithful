import { useState } from 'react';
import { Mail, Search, Calendar, Clock, Sparkles, Car, Tag, CircleCheck as CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  booking_code: string;
  booking_date: string;
  booking_time: string;
  service_type: string;
  service_price: number;
  vehicle_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  created_at: string;
}

export default function ViewBookingsPage() {
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
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Your Bookings ({bookings.length})
                </h2>
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2">
                            <div className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E90FF]" />
                              <span className="text-base sm:text-lg font-bold text-[#1E90FF]">
                                {booking.booking_code}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-green-50 text-green-700 px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Date</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatDate(booking.booking_date)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Time</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {booking.booking_time}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Service</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {booking.service_type}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Car className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Vehicle</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {booking.vehicle_type}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 sm:border-0 sm:pt-0">
                        <p className="text-xs text-gray-500">
                          Booked on {formatDate(booking.created_at)}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                          £{booking.service_price}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
