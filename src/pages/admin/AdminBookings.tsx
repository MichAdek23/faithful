import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, CircleCheck as CheckCircle, Circle as XCircle, Clock, Droplets, ChevronDown } from "lucide-react";
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
  house_number: string;
  street_name: string;
  post_code: string;
  city: string;
}

type StatusFilter = "All Status" | "Confirmed" | "Pending" | "Cancelled" | "Washed";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  washed: "bg-blue-100 text-blue-800",
};

export const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All Status");
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    washed: 0,
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();

    const bookingsSubscription = supabase
      .channel("admin-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      bookingsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
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
        washed: data.filter((b) => b.status === "washed").length,
      });
    }
  };

  const sendStatusEmail = async (booking: Booking, newStatus: string) => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-status-email`;
      await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_id: booking.id,
          booking_code: booking.booking_code || booking.id.slice(0, 8).toUpperCase(),
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          customer_phone: "",
          house_number: booking.house_number || "",
          street_name: booking.street_name || "",
          post_code: booking.post_code || "",
          city: booking.city || "",
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          service_type: booking.service_type,
          service_price: booking.service_price,
          vehicle_type: booking.vehicle_type,
          new_status: newStatus,
        }),
      });
    } catch (err) {
      console.error("Failed to send status email:", err);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    setOpenMenuId(null);

    const booking = bookings.find((b) => b.id === bookingId);

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (!error) {
      if (booking) {
        sendStatusEmail(booking, newStatus);
      }
      await fetchBookings();
    }
    setUpdatingId(null);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.booking_code || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" ||
      booking.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusActions = (currentStatus: string) => {
    const actions: { label: string; status: string; icon: typeof CheckCircle; color: string }[] = [];

    if (currentStatus !== "washed") {
      actions.push({
        label: "Mark as Washed",
        status: "washed",
        icon: Droplets,
        color: "text-blue-600 hover:bg-blue-50",
      });
    }
    if (currentStatus !== "confirmed") {
      actions.push({
        label: "Mark as Confirmed",
        status: "confirmed",
        icon: CheckCircle,
        color: "text-green-600 hover:bg-green-50",
      });
    }
    if (currentStatus !== "pending") {
      actions.push({
        label: "Mark as Pending",
        status: "pending",
        icon: Clock,
        color: "text-yellow-600 hover:bg-yellow-50",
      });
    }
    if (currentStatus !== "cancelled") {
      actions.push({
        label: "Mark as Cancelled",
        status: "cancelled",
        icon: XCircle,
        color: "text-red-600 hover:bg-red-50",
      });
    }

    return actions;
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bookings
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            View, Edit & Manage all Appointments
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Card
            className={`p-4 text-center cursor-pointer transition-all ${
              statusFilter === "All Status"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setStatusFilter("All Status")}
          >
            <p className="text-xs font-medium text-gray-600">Total</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stats.total}
            </p>
          </Card>
          <Card
            className={`p-4 text-center cursor-pointer transition-all ${
              statusFilter === "Washed"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setStatusFilter("Washed")}
          >
            <p className="text-xs font-medium text-gray-600">Washed</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {stats.washed}
            </p>
          </Card>
          <Card
            className={`p-4 text-center cursor-pointer transition-all ${
              statusFilter === "Confirmed"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setStatusFilter("Confirmed")}
          >
            <p className="text-xs font-medium text-gray-600">Not Washed</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {stats.confirmed}
            </p>
          </Card>
          <Card
            className={`p-4 text-center cursor-pointer transition-all ${
              statusFilter === "Pending"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setStatusFilter("Pending")}
          >
            <p className="text-xs font-medium text-gray-600">Pending</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </Card>
          <Card
            className={`p-4 text-center cursor-pointer transition-all ${
              statusFilter === "Cancelled"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setStatusFilter("Cancelled")}
          >
            <p className="text-xs font-medium text-gray-600">Cancelled</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {stats.cancelled}
            </p>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or booking code"
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="flex-1 sm:flex-initial rounded-lg border border-gray-300 px-3 md:px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option>All Status</option>
              <option>Washed</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <Button variant="outline" size="sm" className="sm:inline-flex">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden w-full">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full min-w-[900px]">
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
                    Address
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
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {booking.booking_code ||
                          booking.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.customer_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.customer_email}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {booking.booking_date}
                          </p>
                          <p className="text-gray-500">
                            {booking.booking_time}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {booking.service_type}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {booking.vehicle_type}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {booking.house_number} {booking.street_name}
                          </p>
                          <p className="text-gray-500">
                            {booking.city} {booking.post_code}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        £{booking.service_price}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            STATUS_COLORS[booking.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status === "washed" && (
                            <Droplets className="h-3 w-3" />
                          )}
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="relative">
                          {updatingId === booking.id ? (
                            <span className="text-xs text-gray-500">
                              Updating...
                            </span>
                          ) : booking.status === "washed" ? (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(
                                    openMenuId === booking.id
                                      ? null
                                      : booking.id
                                  );
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                Change Status
                                <ChevronDown className="h-3 w-3" />
                              </button>
                              {openMenuId === booking.id && (
                                <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                  {getStatusActions(booking.status).map(
                                    (action) => (
                                      <button
                                        key={action.status}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateBookingStatus(
                                            booking.id,
                                            action.status
                                          );
                                        }}
                                        className={`flex w-full items-center gap-2 px-4 py-2 text-xs font-medium ${action.color} transition-colors`}
                                      >
                                        <action.icon className="h-3.5 w-3.5" />
                                        {action.label}
                                      </button>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateBookingStatus(booking.id, "washed")
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                              >
                                <Droplets className="h-3 w-3" />
                                Mark Washed
                              </button>
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(
                                      openMenuId === booking.id
                                        ? null
                                        : booking.id
                                    );
                                  }}
                                  className="rounded-lg border border-gray-300 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                                {openMenuId === booking.id && (
                                  <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                    {getStatusActions(booking.status).map(
                                      (action) => (
                                        <button
                                          key={action.status}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateBookingStatus(
                                              booking.id,
                                              action.status
                                            );
                                          }}
                                          className={`flex w-full items-center gap-2 px-4 py-2 text-xs font-medium ${action.color} transition-colors`}
                                        >
                                          <action.icon className="h-3.5 w-3.5" />
                                          {action.label}
                                        </button>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
