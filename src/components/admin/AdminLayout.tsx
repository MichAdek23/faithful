import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, Clock, Users, Settings as SettingsIcon, Star, UserCog, LogOut, ChevronLeft, Bell, Menu, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminData, signOut } = useAdminAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
    { icon: Clock, label: "Time Slot", path: "/admin/timeslot" },
    { icon: Users, label: "Customer", path: "/admin/customers" },
    { icon: SettingsIcon, label: "Service", path: "/admin/services" },
    { icon: Star, label: "Reviews", path: "/admin/reviews" },
    { icon: UserCog, label: "Teams", path: "/admin/teams" },
    { icon: Bell, label: "Notifications", path: "/admin/notifications" },
    { icon: FileText, label: "Blog", path: "/admin/blog" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    fetchUnreadCount();

    const notificationsSubscription = supabase
      .channel('unread-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      notificationsSubscription.unsubscribe();
    };
  }, []);

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    setUnreadCount(count || 0);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#003366] text-white transition-all duration-300 z-50 ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-blue-800 p-4">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold">
                  F
                </div>
                <span className="text-lg font-semibold">Faithful Auto Care</span>
              </div>
            )}
            {isCollapsed && (
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold">
                F
              </div>
            )}
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto h-8 w-8 rounded-lg bg-transparent p-0 hover:bg-blue-800 hidden lg:flex"
            >
              <ChevronLeft className={`h-5 w-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
            </Button>
            <Button
              onClick={() => setIsMobileMenuOpen(false)}
              className="ml-auto h-8 w-8 rounded-lg bg-transparent p-0 hover:bg-blue-800 lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-blue-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-blue-800 p-3 space-y-1">
            <button
              onClick={() => {
                navigate("/admin/settings");
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-300 hover:bg-blue-800 hover:text-white transition-colors"
            >
              <SettingsIcon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </button>
            <button
              onClick={async () => {
                await signOut();
                navigate("/admin/signin");
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-300 hover:bg-blue-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-64"} ml-0 overflow-x-hidden max-w-full`}>
        <header className="sticky top-0 z-30 border-b bg-white px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between lg:justify-end gap-4">
            <Button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden bg-[#003366] hover:bg-[#002855] text-white p-2 h-10 w-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <button
              onClick={() => navigate('/admin/notifications')}
              className="relative text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {adminData?.full_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-gray-900">
                  {adminData?.full_name || 'Admin'}
                </div>
                <div className="text-xs text-gray-500">{adminData?.role || 'Admin'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 overflow-hidden">{children}</div>
      </main>
    </div>
  );
};
