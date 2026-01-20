// Custom service worker code for handling notification clicks
// This will be injected into the generated service worker

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  
  if (data && data.url) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(data.url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(data.url);
        }
      })
    );
  }
});

// Handle push events (for future web push implementation)
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || 'Modern Office System';
    const options = {
      body: data.body || '',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

// Handle background sync (for offline actions)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  // This would sync any pending task updates when back online
  console.log('Syncing tasks...');
  // Implementation would go here
}
