import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog } from "@/components/ui/dialog";
import { Search, Filter, MoveVertical as MoreVertical, Plus, CreditCard as Edit, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  date_joined: string;
  services_completed: number;
  rating: number;
  status: string;
}

interface TeamMemberFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

export const AdminTeams = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [stats, setStats] = useState({ total: 0, active: 0, technicians: 0, bookingOfficers: 0 });
  const [topPerformers, setTopPerformers] = useState<{ name: string; bookings: number; revenue: number }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: "",
    email: "",
    phone: "",
    role: "Technician",
    status: "active"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    fetchTeamMembers();

    const teamMembersSubscription = supabase
      .channel('admin-team-members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        fetchTeamMembers();
      })
      .subscribe();

    return () => {
      teamMembersSubscription.unsubscribe();
    };
  }, []);

  const fetchTeamMembers = async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("rating", { ascending: false });

    if (data) {
      setTeamMembers(data as TeamMember[]);
      setStats({
        total: data.length,
        active: data.filter((m) => m.status === "active").length,
        technicians: data.filter((m) => m.role === "Technician").length,
        bookingOfficers: data.filter((m) => m.role === "Booking Officer").length,
      });

      const top = data
        .slice(0, 3)
        .map((m) => ({
          name: m.name,
          bookings: m.services_completed,
          revenue: m.services_completed * 50,
        }));
      setTopPerformers(top);
    }
  };

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || member.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Technician",
      status: "active"
    });
    setShowModal(true);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      status: member.status
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Technician",
      status: "active"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingMember) {
        const { error } = await supabase
          .from("team_members")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingMember.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("team_members")
          .insert([
            {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              role: formData.role,
              status: formData.status,
              date_joined: new Date().toISOString().split('T')[0],
              services_completed: 0,
              rating: 0
            }
          ]);

        if (error) throw error;
      }

      closeModal();
      fetchTeamMembers();
    } catch (error) {
      console.error("Error saving team member:", error);
      setAlertDialog({
        isOpen: true,
        title: "Error",
        message: "Failed to save team member. Please try again.",
        type: "error",
        showCancel: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setAlertDialog({
      isOpen: true,
      title: "Confirm Delete",
      message: "Are you sure you want to delete this team member? This action cannot be undone.",
      type: "warning",
      showCancel: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from("team_members")
            .delete()
            .eq("id", id);

          if (error) throw error;
          fetchTeamMembers();
        } catch (error) {
          console.error("Error deleting team member:", error);
          setAlertDialog({
            isOpen: true,
            title: "Error",
            message: "Failed to delete team member. Please try again.",
            type: "error",
            showCancel: false,
          });
        }
      },
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="mt-1 text-sm md:text-base text-gray-600">Manage team member & assign roles</p>
          </div>
          <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name"
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
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
          </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Total Members</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-green-600">{stats.active}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Wash Technician</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{stats.technicians}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Booking Officer</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{stats.bookingOfficers}</p>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Service completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ratings
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
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{member.phone}</p>
                        <p className="text-gray-500">{member.email}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {member.date_joined}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{member.role}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {member.services_completed}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {member.rating}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Performer This Week</h2>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <Card key={index} className="p-6 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      #{index + 1} {performer.name}
                    </h3>
                    <p className="text-sm text-gray-600">{performer.bookings} Bookings</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">£{performer.revenue}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingMember ? "Edit Team Member" : "Add Team Member"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSubmitting}
                    placeholder="Enter team member name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isSubmitting}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isSubmitting}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={isSubmitting}
                    required
                  >
                    <option value="Technician">Technician</option>
                    <option value="Booking Officer">Booking Officer</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={isSubmitting}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={closeModal}
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : editingMember ? "Update" : "Add Member"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

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
