import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Issue } from '../types/database';

interface UseIssueRealtimeOptions {
  onNewIssue?: (issue: Issue) => void;
  onIssueUpdate?: (issue: Issue) => void;
  onIssueDelete?: (issueId: string) => void;
}

export const useIssueRealtime = (options: UseIssueRealtimeOptions = {}) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('issues-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'issues',
        },
        (payload) => {
          console.log('New issue created:', payload.new);
          if (options.onNewIssue) {
            options.onNewIssue(payload.new as Issue);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'issues',
        },
        (payload) => {
          console.log('Issue updated:', payload.new);
          if (options.onIssueUpdate) {
            options.onIssueUpdate(payload.new as Issue);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'issues',
        },
        (payload) => {
          console.log('Issue deleted:', payload.old);
          if (options.onIssueDelete && payload.old.id) {
            options.onIssueDelete(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
          console.log('Connected to issues realtime channel');
        } else if (status === 'CLOSED') {
          setConnected(false);
          console.log('Disconnected from issues realtime channel');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [options.onNewIssue, options.onIssueUpdate, options.onIssueDelete]);

  return { connected };
};

// Hook specifically for admin notifications
export const useAdminIssueNotifications = () => {
  const [newIssueCount, setNewIssueCount] = useState(0);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel('admin-issue-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'issues',
        },
        (payload) => {
          const issue = payload.new as Issue;
          setNewIssueCount((prev) => prev + 1);

          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Yeni Sorun Bildirimi', {
              body: `${issue.title}`,
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              tag: `issue-${issue.id}`,
              requireInteraction: false,
              silent: false,
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearNotifications = () => {
    setNewIssueCount(0);
  };

  return { newIssueCount, clearNotifications };
};
