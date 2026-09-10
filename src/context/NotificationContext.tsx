import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type NotificationType = 'exam' | 'event' | 'timetable' | 'helpdesk' | 'system' | 'collab';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string; // ISO string
  isRead: boolean;
  linkTab?: string; // which tab to navigate to on click
  priority: 'high' | 'medium' | 'low';
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'isRead' | 'timestamp'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

// ─── Seed Data Generator ─────────────────────────────────────────────────────

function getSeedNotifications(): AppNotification[] {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString();
  const ago = (m: number) => fmt(new Date(now.getTime() - m * 60 * 1000));

  return [
    {
      id: 'notif_exam_1',
      type: 'exam',
      title: '📋 Exam Schedule Published',
      body: 'End-Semester Examination schedule for Nov 2026 has been officially released. Check the exam timetable now.',
      timestamp: ago(15),
      isRead: false,
      linkTab: 'ask',
      priority: 'high',
    },
    {
      id: 'notif_event_1',
      type: 'event',
      title: '🎓 Annual Tech Fest – Registration Open',
      body: 'TechVista 2026 registrations are now open! Last date to register: September 25, 2026.',
      timestamp: ago(40),
      isRead: false,
      linkTab: 'ask',
      priority: 'high',
    },
    {
      id: 'notif_timetable_1',
      type: 'timetable',
      title: '📅 Updated Class Timetable',
      body: 'Class timetable for CSE Semester 5 has been updated. Please check the new schedule for Monday lectures.',
      timestamp: ago(90),
      isRead: false,
      linkTab: 'ask',
      priority: 'medium',
    },
    {
      id: 'notif_system_1',
      type: 'system',
      title: '✅ Smart Campus AI Hub Online',
      body: 'All systems operational. AI assistant, navigation, and collaboration modules are active.',
      timestamp: ago(180),
      isRead: true,
      priority: 'low',
    },
    {
      id: 'notif_collab_1',
      type: 'collab',
      title: '🤝 New Collaboration Invitation',
      body: 'Dr. Priya Nair has invited you to collaborate on "Edge AI in Smart Agriculture" research project.',
      timestamp: ago(240),
      isRead: false,
      linkTab: 'collaborate',
      priority: 'medium',
    },
    {
      id: 'notif_exam_2',
      type: 'exam',
      title: '⚠️ Internal Assessment Next Week',
      body: 'Internal Assessment II for CS-501 (AI & ML) is scheduled on September 18, 2026 at 10:00 AM in Hall A.',
      timestamp: ago(360),
      isRead: true,
      linkTab: 'ask',
      priority: 'high',
    },
  ];
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getSeedNotifications());

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'isRead' | 'timestamp'>) => {
    const newNotif: AppNotification = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      isRead: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Poll /api/notifications every 60 seconds for new server-pushed alerts
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) return;
        const data: Omit<AppNotification, 'isRead'>[] = await res.json();
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id));
          const incoming = data
            .filter(n => !existingIds.has(n.id))
            .map(n => ({ ...n, isRead: false }));
          if (incoming.length === 0) return prev;
          return [...incoming, ...prev];
        });
      } catch {
        // Network unreachable — use seeded data silently
      }
    };

    const timer = setInterval(poll, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};
