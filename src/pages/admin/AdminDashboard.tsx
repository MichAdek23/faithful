import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Calendar, Euro, Users, TrendingUp, TriangleAlert as AlertTriangle, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Star, Phone, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalBookings: number;
  revenue: number;
  totalCustomers: number;
  avgRating: number;
  completionRate: number;
  cancellationRate: number;
  satisfaction: number;
  bookingsGrowth: number;
  revenueGrowth: number;
  customersGrowth: number;
}

interface Booking {
  id: string;
  customer_name: string;
  booking_time: string;
  service_type: string;
  vehicle_type: string;
  service_price: number;
  status: string;
  customer_phone: string;
  booking_date: string;
  customer_email: string;
}

interface DailyAnalytics {
  day: string;
  revenue: number;
  bookings: number;
  customers: number;
}

interface WeeklyStats {
  dailyData: DailyAnalytics[];
  totalBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  avgBookingsPerDay: number;
  avgRevenuePerDay: number;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    revenue: 0,
    totalCustomers: 0,
    avgRating: 0,
    completionRate: 0,
    cancellationRate: 0,
    satisfaction: 0,
    bookingsGrowth: 0,
    revenueGrowth: 0,
    customersGrowth: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState("appointments");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month">("month");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    dailyData: [],
    totalBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    avgBookingsPerDay: 0,
    avgRevenuePerDay: 0,
  });

  useEffect(() => {
    fetchDashboardData();
    fetchWeeklyAnalytics();
    fetchPendingReviews();

    const bookingsSubscription = supabase
      .channel('dashboard-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDashboardData();
        fetchWeeklyAnalytics();
      })
      .subscribe();

    const reviewsSubscription = supabase
      .channel('dashboard-reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        fetchDashboardData();
        fetchPendingReviews();
      })
      .subscribe();

    return () => {
      bookingsSubscription.unsubscribe();
      reviewsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  const getDateRange = () => {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    if (dateFilter === "today") {
      return { start: startOfToday.toISOString().split('T')[0], end: startOfToday.toISOString().split('T')[0] };
    } else if (dateFilter === "week") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 6);
      return { start: startOfWeek.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] };
    } else {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: startOfMonth.toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] };
    }
  };

  const fetchDashboardData = async () => {
    const { start, end } = getDateRange();

    // Calculate previous period for comparison
    const startDate = new Date(start);
    const endDate = new Date(end);
    const periodLength = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const previousStart = new Date(startDate);
    previousStart.setDate(startDate.getDate() - periodLength);
    const previousEnd = new Date(startDate);
    previousEnd.setDate(startDate.getDate() - 1);

    // Fetch current period data
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .gte("booking_date", start)
      .lte("booking_date", end);

    // Fetch previous period data
    const { data: previousBookings } = await supabase
      .from("bookings")
      .select("*")
      .gte("booking_date", previousStart.toISOString().split('T')[0])
      .lte("booking_date", previousEnd.toISOString().split('T')[0]);

    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("status", "approved");

    if (bookings) {
      const totalBookings = bookings.length;
      const revenue = bookings.reduce((sum, b) => sum + (b.service_price || 0), 0);
      const uniqueCustomers = new Set(bookings.map(b => b.customer_email)).size;
      const confirmed = bookings.filter(b => b.status === "confirmed").length;
      const cancelled = bookings.filter(b => b.status === "cancelled").length;

      // Calculate previous period stats
      const prevTotalBookings = previousBookings?.length || 0;
      const prevRevenue = previousBookings?.reduce((sum, b) => sum + (b.service_price || 0), 0) || 0;
      const prevUniqueCustomers = previousBookings ? new Set(previousBookings.map(b => b.customer_email)).size : 0;

      // Calculate growth percentages
      const bookingsGrowth = prevTotalBookings > 0
        ? Math.round(((totalBookings - prevTotalBookings) / prevTotalBookings) * 1000) / 10
        : totalBookings > 0 ? 100 : 0;

      const revenueGrowth = prevRevenue > 0
        ? Math.round(((revenue - prevRevenue) / prevRevenue) * 1000) / 10
        : revenue > 0 ? 100 : 0;

      const customersGrowth = prevUniqueCustomers > 0
        ? Math.round(((uniqueCustomers - prevUniqueCustomers) / prevUniqueCustomers) * 1000) / 10
        : uniqueCustomers > 0 ? 100 : 0;

      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      setStats({
        totalBookings,
        revenue,
        totalCustomers: uniqueCustomers,
        avgRating: Math.round(avgRating * 10) / 10,
        completionRate: totalBookings > 0 ? Math.round((confirmed / totalBookings) * 100) : 0,
        cancellationRate: totalBookings > 0 ? Math.round((cancelled / totalBookings) * 100) : 0,
        satisfaction: avgRating,
        bookingsGrowth,
        revenueGrowth,
        customersGrowth,
      });

      const upcoming = bookings
        .filter(b => b.status === "confirmed")
        .sort((a, b) => new Date(a.booking_date + ' ' + a.booking_time).getTime() - new Date(b.booking_date + ' ' + b.booking_time).getTime())
        .slice(0, 3);
      setUpcomingBookings(upcoming as Booking[]);
    }
  };

  const fetchPendingReviews = async () => {
    const { data, count } = await supabase
      .from("reviews")
      .select("*", { count: 'exact', head: true })
      .eq("status", "pending");

    setPendingReviews(count || 0);
  };

  const fetchWeeklyAnalytics = async () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .gte("booking_date", sevenDaysAgo.toISOString().split('T')[0])
      .lte("booking_date", today.toISOString().split('T')[0]);

    if (bookings) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyData: DailyAnalytics[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];

        const dayBookings = bookings.filter(b => b.booking_date === dateString);
        const dayRevenue = dayBookings.reduce((sum, b) => sum + (b.service_price || 0), 0);
        const dayCustomers = new Set(dayBookings.map(b => b.customer_email)).size;

        dailyData.push({
          day: dayName,
          revenue: dayRevenue,
          bookings: dayBookings.length,
          customers: dayCustomers,
        });
      }

      const totalBookings = bookings.length;
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.service_price || 0), 0);
      const totalCustomers = new Set(bookings.map(b => b.customer_email)).size;

      setWeeklyStats({
        dailyData,
        totalBookings,
        totalRevenue,
        totalCustomers,
        avgBookingsPerDay: Math.round(totalBookings / 7),
        avgRevenuePerDay: Math.round(totalRevenue / 7),
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant={dateFilter === "today" ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setDateFilter("today")}
            >
              Today
            </Button>
            <Button
              variant={dateFilter === "week" ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setDateFilter("week")}
            >
              This Week
            </Button>
            <Button
              variant={dateFilter === "month" ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setDateFilter("month")}
            >
              This Month
            </Button>
          </div>
        </div>

        <p className="text-sm md:text-base text-gray-600">Welcome back! Here is your business review</p>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                <p className={`mt-1 text-xs sm:text-sm ${stats.bookingsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.bookingsGrowth >= 0 ? '+' : ''}{stats.bookingsGrowth}% vs previous period
                </p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">£{stats.revenue.toLocaleString()}</p>
                <p className={`mt-1 text-xs sm:text-sm ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% vs previous period
                </p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100">
                <Euro className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customer</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                <p className={`mt-1 text-xs sm:text-sm ${stats.customersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.customersGrowth >= 0 ? '+' : ''}{stats.customersGrowth}% vs previous period
                </p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">Based on review</p>
              </div>
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {pendingReviews > 0 && (
            <Card className="bg-yellow-50 p-6 border-yellow-200">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Customer Review</h3>
                  <p className="mt-1 text-sm text-gray-700">
                    You have {pendingReviews} customer review{pendingReviews > 1 ? 's' : ''} pending and waiting for your approval
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => navigate('/admin/reviews')}
                  >
                    Action required
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card className="bg-red-50 p-6 border-red-200">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">No Show Rate</h3>
                <p className="mt-1 text-sm text-gray-700">
                  Current no show rate is 10%, consider monitoring and follow up
                </p>
                <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700">
                  Monitor
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-orange-50 p-6 border-orange-200">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Peak Hours</h3>
                <p className="mt-1 text-sm text-gray-700">
                  Peak Hours : Fri 10am -3pm<br />
                  Sat 8am - 7pm
                </p>
                <Button size="sm" className="mt-3 bg-orange-600 hover:bg-orange-700">
                  11am - 1pm
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-green-50 p-6 border-green-200">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">System Health</h3>
                <p className="mt-1 text-sm text-gray-700">
                  The system is running smoothly with no issues detected.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center gap-4 border-b pb-0">
              <button
                onClick={() => setActiveTab("appointments")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "appointments"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Upcoming Appointments
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "analytics"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Weekly Analytics
              </button>
            </div>

            {activeTab === "appointments" && (
              <div className="mt-4 space-y-4">
                {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {booking.booking_time}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Service</p>
                          <p className="font-medium text-gray-900">{booking.service_type}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Vehicle</p>
                          <p className="font-medium text-gray-900">{booking.vehicle_type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      booking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{booking.customer_phone}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">£ {booking.service_price}</p>
                      <Button
                        size="sm"
                        className="mt-2 bg-blue-600 hover:bg-blue-700"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="mt-4 space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Daily Revenue</h3>
                  <div className="flex items-end justify-between gap-2" style={{ height: "200px" }}>
                    {weeklyStats.dailyData.map((item, index) => {
                      const maxRevenue = Math.max(...weeklyStats.dailyData.map(d => d.revenue), 1);
                      const height = (item.revenue / maxRevenue) * 180;

                      return (
                        <div key={index} className="flex flex-1 flex-col items-center">
                          <div className="relative w-full">
                            <div
                              className="w-full rounded-t bg-blue-600"
                              style={{ height: `${height}px` }}
                            />
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600">
                              £{item.revenue}
                            </span>
                          </div>
                          <span className="mt-2 text-xs text-gray-600">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-blue-600" />
                      <span className="text-gray-600">Revenue</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-yellow-100 p-3 text-center">
                    <span className="text-xs text-gray-600">Bookings</span>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-3 text-center">
                    <span className="text-xs text-gray-600">Customer</span>
                  </div>
                </div>

                <div>
                  <div className="relative" style={{ height: "200px" }}>
                    <svg className="h-full w-full" viewBox="0 0 350 200">
                      <polyline
                        fill="none"
                        stroke="#EAB308"
                        strokeWidth="2"
                        points={weeklyStats.dailyData.map((item, i) => {
                          const maxBookings = Math.max(...weeklyStats.dailyData.map(d => d.bookings), 1);
                          const x = (i * 350) / 6;
                          const y = 180 - ((item.bookings / maxBookings) * 140);
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      <polyline
                        fill="none"
                        stroke="#9333EA"
                        strokeWidth="2"
                        points={weeklyStats.dailyData.map((item, i) => {
                          const maxCustomers = Math.max(...weeklyStats.dailyData.map(d => d.customers), 1);
                          const x = (i * 350) / 6;
                          const y = 180 - ((item.customers / maxCustomers) * 140);
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 px-2">
                      {weeklyStats.dailyData.map((item, index) => (
                        <span key={index}>{item.day}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Booking (This week)</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{weeklyStats.totalBookings}</p>
                    <p className="text-xs text-gray-500">Average: {weeklyStats.avgBookingsPerDay} per day</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue (This week)</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">£ {weeklyStats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Average: £{weeklyStats.avgRevenuePerDay} per day</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Customer (This week)</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{weeklyStats.totalCustomers}</p>
                    <p className="text-xs text-gray-500">Average: {Math.round(weeklyStats.totalCustomers / 7)} per day</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="mt-2 text-4xl font-bold text-gray-900">{stats.completionRate}%</p>
                <p className="mt-1 text-sm text-green-600">+5.2% (30 days)</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600">Cancellation Rate</p>
                <p className="mt-2 text-4xl font-bold text-gray-900">{stats.cancellationRate}%</p>
                <p className="mt-1 text-sm text-green-600">-3.2% (30 days)</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-yellow-100">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-600">Customer Satisfaction</p>
                <p className="mt-2 text-4xl font-bold text-gray-900">{stats.satisfaction.toFixed(1)}/5</p>
                <p className="mt-1 text-sm text-green-600">+0.2% (30 days)</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.booking_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service Type</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.service_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vehicle Type</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.vehicle_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-semibold text-gray-900 text-xl">£{selectedBooking.service_price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    selectedBooking.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Code</p>
                  <p className="font-semibold text-gray-900">{selectedBooking.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end border-t pt-4 mt-6">
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                  Close
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    navigate('/admin/bookings');
                    setSelectedBooking(null);
                  }}
                >
                  View in Bookings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
