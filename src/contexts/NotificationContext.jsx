import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      setLoading(true);
      const [list, unread] = await Promise.all([
        notificationService.getRecipientNotifications(user.id),
        notificationService.getUnreadCount(user.id),
      ]);
      setNotifications(list || []);
      setUnreadCount(unread?.count || 0);
    } catch (_error) {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const markRead = useCallback(
    async (notificationId) => {
      await notificationService.markRead(notificationId);
      await fetchNotifications();
    },
    [fetchNotifications],
  );

  const markAllRead = useCallback(async () => {
    if (!user?.id) return;
    await notificationService.markAllRead(user.id);
    await fetchNotifications();
  }, [fetchNotifications, user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markRead,
      markAllRead,
    }),
    [fetchNotifications, loading, markAllRead, markRead, notifications, unreadCount],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}


