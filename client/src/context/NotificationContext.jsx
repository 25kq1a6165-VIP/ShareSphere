import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// Audio synthesizer for pleasant in-app notification chime (no external MP3 needed)
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle high two-tone chord
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (e) {
    // Audio context may be restricted by autoplay policy before user gesture
  }
}

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState({
    booking_updates: true,
    booking_reminders: true,
    cancellation_updates: true,
    payment_updates: true,
    browser_push: false,
    reminder_time_1: 30,
    reminder_time_2: 5,
  });
  const [activeFilter, setActiveFilter] = useState('all');
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected' | 'connecting' | 'disconnected'
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Fetch full notifications list with current active category filter
  const fetchNotifications = useCallback(async (category = activeFilter, search = '') => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/notifications', {
        params: {
          category: category !== 'all' ? category : undefined,
          search: search || undefined,
          limit: 50,
        }
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
        if (res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        } else {
          setUnreadCount(res.data.data.filter(n => !n.is_read).length);
        }
      }
    } catch (err) {
      // Ignore background network errors
    }
  }, [user, activeFilter]);

  // Fetch quick unread badge count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data?.success && typeof res.data.count === 'number') {
        setUnreadCount(res.data.count);
      }
    } catch (e) {
      // Fallback
    }
  }, [user]);

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/preferences');
      if (res.data?.success && res.data.data) {
        setPreferences(res.data.data);
      }
    } catch (e) {
      // Fallback
    }
  }, [user]);

  // Handle incoming real-time notification
  const handleIncomingNotification = useCallback((newNotif) => {
    // Play in-app audio chime
    playNotificationChime();

    // Prepend to notifications list
    setNotifications(prev => {
      // Deduplicate by ID
      if (prev.some(n => n.id === newNotif.id)) return prev;
      return [newNotif, ...prev];
    });

    // Increment unread count
    setUnreadCount(prev => prev + 1);

    // Browser Push Notification if granted and enabled
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newNotif.title || 'ShareSphere Alert', {
          body: newNotif.message || '',
          icon: '/favicon.ico',
          tag: `sharesphere_notif_${newNotif.id}`,
        });
      } catch (e) {
        // Notification constructor may fail in some environments
      }
    }
  }, []);

  // Connect to Server-Sent Events stream
  const connectSSE = useCallback(() => {
    if (!user) return;

    // Clean up existing EventSource if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnectionStatus('connecting');

    const authToken = token || localStorage.getItem('sharesphere_token') || 'demo_token';
    const baseUrl = api.defaults.baseURL || '/api';
    const sseUrl = `${baseUrl}/notifications/stream?token=${encodeURIComponent(authToken)}`;

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.addEventListener('connected', () => {
        setConnectionStatus('connected');
      });

      es.addEventListener('notification', (e) => {
        try {
          const data = JSON.parse(e.data);
          handleIncomingNotification(data);
        } catch (err) {
          console.error('[SSE Parse Error]', err);
        }
      });

      es.onerror = () => {
        setConnectionStatus('disconnected');
        es.close();
        eventSourceRef.current = null;

        // Auto-reconnect with 5-second backoff
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectSSE();
          }, 5000);
        }
      };
    } catch (err) {
      setConnectionStatus('disconnected');
    }
  }, [user, token, handleIncomingNotification]);

  // Initialize and clean up SSE on mount/auth change
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();
      connectSSE();

      // Fallback polling interval every 30 seconds
      const pollInterval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => {
        clearInterval(pollInterval);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setConnectionStatus('disconnected');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  }, [user, fetchNotifications, fetchPreferences, fetchUnreadCount, connectSSE]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: 1, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPrefs) => {
    try {
      const res = await api.patch('/notifications/preferences', newPrefs);
      if (res.data?.success && res.data.data) {
        setPreferences(res.data.data);
      } else {
        setPreferences(prev => ({ ...prev, ...newPrefs }));
      }
      return { success: true };
    } catch (err) {
      console.error('Failed to update preferences:', err);
      return { success: false, error: err.message };
    }
  };

  // Request browser desktop notification permission
  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await updatePreferences({ browser_push: true });
      return true;
    } else {
      await updatePreferences({ browser_push: false });
      return false;
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      preferences,
      connectionStatus,
      activeFilter,
      setActiveFilter,
      fetchNotifications,
      fetchUnreadCount,
      markAsRead,
      markAllAsRead,
      updatePreferences,
      requestBrowserPermission,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
