import { useState, useCallback, useMemo } from 'react';

export interface AppNotification {
  id: string;
  type: 'payment' | 'milestone' | 'message' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', type: 'milestone', title: 'Milestone Pending Review', body: 'Framing & Masonry ready for approval — Kicukiro Home', time: '2h ago', read: false },
  { id: 'n2', type: 'payment',   title: 'Deposit Confirmed ✓',     body: '10,000,000 RWF added via MTN MoMo',                                  time: '1d ago', read: false },
  { id: 'n3', type: 'message',   title: 'New Message — Eric',       body: '12 new progress photos uploaded for Kicukiro Home',                  time: '2d ago', read: true  },
  { id: 'n4', type: 'system',    title: 'Supervisor Assigned',       body: 'Aline Mukamana confirmed as supervisor',                            time: '3d ago', read: true  },
  { id: 'n5', type: 'milestone', title: 'Inspection Report Ready',   body: 'Foundation & Pillars — PASSED by Aline',                           time: '4d ago', read: true  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markAllRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);

  const markOneRead = useCallback((id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id'>) => {
    setNotifications(prev => [{ ...notification, id: `n-${Date.now()}` }, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAllRead,
    markOneRead,
    addNotification,
  };
}
