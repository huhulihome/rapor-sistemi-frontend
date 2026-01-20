import { useEffect, useCallback } from 'react';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  showTaskAssignmentNotification,
  showIssueNotification,
  showTaskDeadlineNotification,
  showUpdateNotification,
  setupNotificationClickHandler,
} from '../utils/pushNotifications';

export interface NotificationHook {
  isSupported: boolean;
  permission: NotificationPermission;
  notifyTaskAssignment: (taskTitle: string, taskId: string) => Promise<void>;
  notifyIssue: (issueTitle: string, issueId: string, priority: string) => Promise<void>;
  notifyTaskDeadline: (taskTitle: string, taskId: string, hoursRemaining: number) => Promise<void>;
  notifyUpdate: (title: string, message: string, url?: string) => Promise<void>;
}

export const useNotifications = (): NotificationHook => {
  const isSupported = isPushNotificationSupported();
  const permission = getNotificationPermission();

  useEffect(() => {
    // Setup notification click handler
    setupNotificationClickHandler();
  }, []);

  const notifyTaskAssignment = useCallback(
    async (taskTitle: string, taskId: string) => {
      if (permission === 'granted') {
        await showTaskAssignmentNotification(taskTitle, taskId);
      }
    },
    [permission]
  );

  const notifyIssue = useCallback(
    async (issueTitle: string, issueId: string, priority: string) => {
      if (permission === 'granted') {
        await showIssueNotification(issueTitle, issueId, priority);
      }
    },
    [permission]
  );

  const notifyTaskDeadline = useCallback(
    async (taskTitle: string, taskId: string, hoursRemaining: number) => {
      if (permission === 'granted') {
        await showTaskDeadlineNotification(taskTitle, taskId, hoursRemaining);
      }
    },
    [permission]
  );

  const notifyUpdate = useCallback(
    async (title: string, message: string, url?: string) => {
      if (permission === 'granted') {
        await showUpdateNotification(title, message, url);
      }
    },
    [permission]
  );

  return {
    isSupported,
    permission,
    notifyTaskAssignment,
    notifyIssue,
    notifyTaskDeadline,
    notifyUpdate,
  };
};
