import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Customer {
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  spent: number;
}

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, revenue: 0, avgSpend: 0 });

  useEffect(() => {
    fetchCustomers();

    const bookingsSubscription = supabase
      .channel("admin-customers")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchCustomers();
      })
      .subscribe();

    return () => {
      bookingsSubscription.unsubscribe();
    };
  }, []);

  const fetchCustomers = async () => {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (bookings) {
      const customerMap = new Map<string, Customer>();

      bookings.forEach((booking) => {
        const existing = customerMap.get(booking.customer_email);
        if (existing) {
          existing.totalBookings += 1;
          existing.totalSpent += booking.service_price || 0;
          existing.spent += booking.service_price || 0;
          if (booking.booking_date > existing.lastBooking) {
            existing.lastBooking = booking.booking_date;
          }
        } else {
          customerMap.set(booking.customer_email, {
            name: booking.customer_name,
            email: booking.customer_email,
            phone: booking.customer_phone || "",
            totalBookings: 1,
            totalSpent: booking.service_price || 0,
            lastBooking: booking.booking_date,
            spent: booking.service_price || 0,
          });
        }
      });

      const customerList = Array.from(customerMap.values()).sort(
        (a, b) => b.totalSpent - a.totalSpent
      );

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeCustomers = customerList.filter(
        (c) => new Date(c.lastBooking) >= thirtyDaysAgo
      ).length;

      const totalRevenue = customerList.reduce((sum, c) => sum + c.totalSpent, 0);

      setCustomers(customerList);
      setStats({
        total: customerList.length,
        active: activeCustomers,
        revenue: totalRevenue,
        avgSpend: customerList.length > 0 ? Math.round(totalRevenue / customerList.length) : 0,
      });
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm md:text-base text-gray-600">View & Manage all Customers</p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Active (30d)</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">£{stats.revenue}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Spend</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">£{stats.avgSpend}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or email"
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Card className="hidden md:block overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Booking
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {customer.phone || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {customer.totalBookings}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      £{customer.totalSpent}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(customer.lastBooking).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="md:hidden space-y-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.email} className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{customer.name}</p>
                  <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{customer.totalBookings} bookings</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-xl md:text-2xl font-bold text-blue-600 whitespace-nowrap">£{customer.spent}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(customer.lastBooking).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};
