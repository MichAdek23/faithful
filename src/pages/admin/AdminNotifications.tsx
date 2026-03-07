import { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AlertDialog } from '../../components/ui/dialog';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface AdminNotification {
  id: string;
  name: string;
  email: string;
  receive_new_bookings: boolean;
  is_active: boolean;
  created_at: string;
}

export function AdminNotifications() {
  const [admins, setAdmins] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    fetchAdmins();

    const notificationsSubscription = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notifications' }, () => {
        fetchAdmins();
      })
      .subscribe();

    return () => {
      notificationsSubscription.unsubscribe();
    };
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAdmins(data);
    }
    setLoading(false);
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email) {
      setError('Please fill in all fields');
      return;
    }

    const { error: insertError } = await supabase
      .from('admin_notifications')
      .insert([
        {
          name: newAdmin.name,
          email: newAdmin.email,
          receive_new_bookings: true,
          is_active: true,
        },
      ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess('Admin added successfully');
      setNewAdmin({ name: '', email: '' });
      setShowAddForm(false);
      fetchAdmins();
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const { error: updateError } = await supabase
      .from('admin_notifications')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!updateError) {
      setSuccess('Status updated successfully');
      fetchAdmins();
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleToggleNotifications = async (id: string, currentStatus: boolean) => {
    const { error: updateError } = await supabase
      .from('admin_notifications')
      .update({ receive_new_bookings: !currentStatus })
      .eq('id', id);

    if (!updateError) {
      setSuccess('Notification preference updated');
      fetchAdmins();
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDelete = (id: string) => {
    setAlertDialog({
      isOpen: true,
      title: "Confirm Delete",
      message: "Are you sure you want to delete this admin? This action cannot be undone.",
      type: "warning",
      showCancel: true,
      onConfirm: async () => {
        const { error: deleteError } = await supabase
          .from('admin_notifications')
          .delete()
          .eq('id', id);

        if (!deleteError) {
          setSuccess('Admin deleted successfully');
          fetchAdmins();
          setTimeout(() => setSuccess(''), 3000);
        }
      },
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Email Notifications</h2>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage who receives booking notification emails</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#1E90FF] hover:bg-[#1873CC] w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Admin</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                type="text"
                placeholder="Admin Name"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleAddAdmin}
              className="bg-[#1E90FF] hover:bg-[#1873CC] w-full sm:w-auto"
            >
              Add Admin
            </Button>
            <Button
              onClick={() => {
                setShowAddForm(false);
                setNewAdmin({ name: '', email: '' });
                setError('');
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{admin.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(admin.id, admin.is_active)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        admin.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {admin.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        handleToggleNotifications(admin.id, admin.receive_new_bookings)
                      }
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        admin.receive_new_bookings
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {admin.receive_new_bookings ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      onClick={() => handleDelete(admin.id)}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {admins.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No admin notification recipients configured</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="mt-4 bg-[#1E90FF] hover:bg-[#1873CC]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Admin
          </Button>
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
}
