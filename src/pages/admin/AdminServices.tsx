import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, AlertDialog } from "@/components/ui/dialog";
import { Clock, CreditCard as Edit, Copy, Trash2, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  is_active: boolean;
}

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
  is_active: boolean;
}

export const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, revenue: 0 });
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: 0,
    duration: 30,
    features: [],
    is_active: true,
  });
  const [featureInput, setFeatureInput] = useState("");
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
    fetchServices();

    const servicesSubscription = supabase
      .channel('admin-services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        fetchServices();
      })
      .subscribe();

    return () => {
      servicesSubscription.unsubscribe();
    };
  }, []);

  const fetchServices = async () => {
    const { data } = await supabase.from("services").select("*").order("created_at", { ascending: false });

    if (data) {
      const parsedServices = data.map((service) => ({
        ...service,
        features: Array.isArray(service.features) ? service.features : [],
      }));
      setServices(parsedServices);
      setStats({
        total: data.length,
        active: data.filter((s) => s.is_active).length,
        revenue: 2500,
      });
    }
  };

  const openAddDialog = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      duration: 30,
      features: [],
      is_active: true,
    });
    setFeatureInput("");
    setShowServiceDialog(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      features: [...service.features],
      is_active: service.is_active,
    });
    setFeatureInput("");
    setShowServiceDialog(true);
  };

  const handleSaveService = async () => {
    if (!formData.name || formData.price <= 0) {
      setAlertDialog({
        isOpen: true,
        title: "Validation Error",
        message: "Please fill in all required fields with valid values.",
        type: "error",
        showCancel: false,
      });
      return;
    }

    if (editingService) {
      await supabase
        .from("services")
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          duration: formData.duration,
          features: formData.features,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingService.id);
    } else {
      await supabase.from("services").insert({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        duration: formData.duration,
        features: formData.features,
        is_active: formData.is_active,
      });
    }

    setShowServiceDialog(false);
    fetchServices();
  };

  const handleToggleActive = async (service: Service) => {
    await supabase
      .from("services")
      .update({ is_active: !service.is_active })
      .eq("id", service.id);
    fetchServices();
  };

  const handleDuplicate = async (service: Service) => {
    await supabase.from("services").insert({
      name: `${service.name} (Copy)`,
      description: service.description,
      price: service.price,
      duration: service.duration,
      features: service.features,
      is_active: false,
    });
    fetchServices();
  };

  const handleDelete = (id: string) => {
    setAlertDialog({
      isOpen: true,
      title: "Confirm Delete",
      message: "Are you sure you want to delete this service? This action cannot be undone.",
      type: "warning",
      showCancel: true,
      onConfirm: async () => {
        await supabase.from("services").delete().eq("id", id);
        fetchServices();
      },
    });
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      });
      setFeatureInput("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Service Management</h1>
            <p className="mt-1 text-sm md:text-base text-gray-600">Add, Edit, & Disable Service</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            onClick={openAddDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Total Service</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-green-600">{stats.active}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">£{stats.revenue}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">{service.name}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{service.description}</p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={service.is_active}
                        onChange={() => handleToggleActive(service)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <p className="text-2xl font-bold text-gray-900">£{service.price}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration} min</span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700">
                      <span className="mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(service)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDuplicate(service)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Dialog
          isOpen={showServiceDialog}
          onClose={() => setShowServiceDialog(false)}
          title={editingService ? "Edit Service" : "Add New Service"}
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Service Name</label>
              <Input
                type="text"
                placeholder="e.g., Premium Wash"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <Input
                type="text"
                placeholder="Brief description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price (£)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Duration (min)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Features</label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Add a feature"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button type="button" onClick={addFeature} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Active Service</label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowServiceDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveService}
              >
                {editingService ? "Update Service" : "Add Service"}
              </Button>
            </div>
          </div>
        </Dialog>

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
