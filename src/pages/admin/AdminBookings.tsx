import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, MoveVertical as MoreVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Booking {
  id: string;
  booking_code: string;
  customer_name: string;
  customer_email: string;
  booking_date: string;
  booking_time: string;
  service_type: string;
  vehicle_type: string;
  service_price: number;
  status: string;
}

export const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, cancelled: 0 });

  useEffect(() => {
    fetchBookings();

    const bookingsSubscription = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      bookingsSubscription.unsubscribe();
    };
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setBookings(data as Booking[]);
      setStats({
        total: data.length,
        confirmed: data.filter((b) => b.status === "confirmed").length,
        pending: data.filter((b) => b.status === "pending").length,
        cancelled: data.filter((b) => b.status === "cancelled").length,
      });
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || booking.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm md:text-base text-gray-600">View, Edit & Manage all Appointments</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or email"
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="flex-1 sm:flex-initial rounded-lg border border-gray-300 px-3 md:px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <Button variant="outline" size="sm" className="sm:inline-flex">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {booking.booking_code || booking.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.customer_name}</p>
                        <p className="text-sm text-gray-500">{booking.customer_email}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{booking.booking_date}</p>
                        <p className="text-gray-500">{booking.booking_time}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {booking.service_type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {booking.vehicle_type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      £{booking.service_price}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-4 gap-4">
          <Card className="p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Total Booking</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Confirmed</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{stats.confirmed}</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Cancelled</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{stats.cancelled}</p>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};
