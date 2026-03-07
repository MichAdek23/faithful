import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, AlertCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  booking_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export function AdminNotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();

    const notificationsSubscription = supabase
      .channel('notifications-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      notificationsSubscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);

    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false);

    fetchNotifications();
  };

  const deleteNotification = async (id: string) => {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    fetchNotifications();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'review':
        return '⭐';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const filteredNotifications = notifications.filter(n =>
    filter === 'all' ? true : !n.is_read
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-blue-50 border-blue-300' : ''}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'bg-blue-50 border-blue-300' : ''}
            >
              Unread ({unreadCount})
            </Button>
            {unreadCount > 0 && (
              <Button
                size="sm"
                onClick={markAllAsRead}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-gray-500">Loading notifications...</div>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <Bell className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread'
                  ? 'All notifications have been read'
                  : 'Notifications will appear here when you receive them'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all hover:shadow-md ${
                  !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                            className="whitespace-nowrap"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Mark read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
