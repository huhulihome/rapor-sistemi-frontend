// Push notification utilities for browser notifications

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default';

/**
 * Check if push notifications are supported
 */
export const isPushNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermissionStatus => {
  if (!isPushNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications are not supported');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Show a local notification
 */
export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if (!isPushNotificationSupported()) {
    console.warn('Notifications are not supported');
    return;
  }

  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    // If service worker is available, use it for better reliability
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options,
      } as any); // Use 'as any' to bypass TypeScript limitations with notification options
    } else {
      // Fallback to regular notification
      new Notification(title, {
        icon: '/icon-192x192.png',
        ...options,
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

/**
 * Show task assignment notification
 */
export const showTaskAssignmentNotification = async (
  taskTitle: string,
  taskId: string
): Promise<void> => {
  await showNotification('Yeni Görev Atandı', {
    body: taskTitle,
    tag: `task-${taskId}`,
    requireInteraction: true,
    data: {
      type: 'task_assignment',
      taskId,
      url: `/tasks/${taskId}`,
    },
  } as any);
};

/**
 * Show issue notification (for admins)
 */
export const showIssueNotification = async (
  issueTitle: string,
  issueId: string,
  priority: string
): Promise<void> => {
  const priorityEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  }[priority] || '⚪';

  await showNotification('Yeni Sorun Bildirimi', {
    body: `${priorityEmoji} ${issueTitle}`,
    tag: `issue-${issueId}`,
    requireInteraction: true,
    data: {
      type: 'issue_created',
      issueId,
      priority,
      url: `/admin/issues/${issueId}`,
    },
  } as any);
};

/**
 * Show task deadline notification
 */
export const showTaskDeadlineNotification = async (
  taskTitle: string,
  taskId: string,
  hoursRemaining: number
): Promise<void> => {
  const urgencyLevel = hoursRemaining <= 2 ? 'critical' : hoursRemaining <= 24 ? 'high' : 'medium';
  const urgencyEmoji = urgencyLevel === 'critical' ? '🔴' : urgencyLevel === 'high' ? '🟠' : '🟡';

  await showNotification('Görev Teslim Tarihi Yaklaşıyor', {
    body: `${urgencyEmoji} ${taskTitle} - ${hoursRemaining} saat kaldı`,
    tag: `task-deadline-${taskId}`,
    requireInteraction: urgencyLevel === 'critical',
    data: {
      type: 'task_deadline',
      taskId,
      hoursRemaining,
      url: `/tasks/${taskId}`,
    },
  } as any);
};

/**
 * Show general update notification
 */
export const showUpdateNotification = async (
  title: string,
  message: string,
  url?: string
): Promise<void> => {
  await showNotification(title, {
    body: message,
    tag: 'general-update',
    data: {
      type: 'general_update',
      url,
    },
  });
};

/**
 * Subscribe to push notifications (for future web push implementation)
 */
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      // Note: You'll need to generate VAPID keys for production
      // For now, this is a placeholder
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return null;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
      });
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

/**
 * Helper function to convert VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Handle notification click events
 */
export const setupNotificationClickHandler = (): void => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'notification-click') {
      const { url } = event.data;
      if (url) {
        window.location.href = url;
      }
    }
  });
};
