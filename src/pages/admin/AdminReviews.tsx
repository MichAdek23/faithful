import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog } from "@/components/ui/dialog";
import { Search, Filter, Star, Check, X, Trash2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Review {
  id: string;
  customer_name: string;
  service_type: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
}

export const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, avgRating: 0 });
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "error" | "warning" | "success";
    showCancel: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    showCancel: false,
  });

  useEffect(() => {
    fetchReviews();

    const reviewsSubscription = supabase
      .channel('admin-reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => {
      reviewsSubscription.unsubscribe();
    };
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setReviews(data as Review[]);
      const approved = data.filter((r) => r.status === "approved");
      const avgRating =
        approved.length > 0 ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length : 0;

      setStats({
        total: data.length,
        pending: data.filter((r) => r.status === "pending").length,
        approved: approved.length,
        avgRating: Math.round(avgRating * 10) / 10,
      });
    }
  };

  const handleApprove = async (id: string) => {
    await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
    fetchReviews();
  };

  const handleReject = async (id: string) => {
    await supabase.from("reviews").update({ status: "rejected" }).eq("id", id);
    fetchReviews();
  };

  const handleDelete = (id: string) => {
    setAlertDialog({
      isOpen: true,
      title: "Confirm Delete",
      message: "Are you sure you want to delete this review? This action cannot be undone.",
      type: "warning",
      showCancel: true,
      onConfirm: async () => {
        await supabase.from("reviews").delete().eq("id", id);
        fetchReviews();
      },
    });
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || review.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reviews</h1>
            <p className="mt-1 text-sm md:text-base text-gray-600">Approve, Delete & Manage Reviews</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name"
              className="w-full pl-10"
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
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Total Reviews</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-yellow-600">{stats.pending}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Approved</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-green-600">{stats.approved}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Average Rating</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{stats.avgRating}/5</p>
          </Card>
        </div>

        <div className="space-y-3 md:space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">{review.customer_name}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        review.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : review.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {review.service_type} • {new Date(review.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-2 flex items-center gap-1">{renderStars(review.rating)}</div>
                  <p className="mt-3 text-gray-700">{review.comment}</p>
                </div>
                <div className="flex items-center gap-2">
                  {review.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(review.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleReject(review.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
          onConfirm={alertDialog.onConfirm}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
          showCancel={alertDialog.showCancel}
        />
      </div>
    </AdminLayout>
  );
};
