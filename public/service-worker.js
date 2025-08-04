// Basic service worker for offline support
const CACHE_NAME = 'ematernity-cache-v2';
const OFFLINE_URL = '/offline.html';
const IMAGE_ASSETS = [
  '/src/images/img1.jpg', '/src/images/img2.jpg', '/src/images/img3.jpg', '/src/images/img4.jpg', '/src/images/img5.jpg',
  '/src/images/img6.png', '/src/images/img7.png', '/src/images/img8.png', '/src/images/img9.jpg', '/src/images/img10.jpg',
  '/src/images/img11.jpg', '/src/images/img12.jpg', '/src/images/img13.jpg', '/src/images/img14.jpg', '/src/images/img15.jpg',
  '/src/images/img16.jpg', '/src/images/img17.jpg', '/src/images/img18.jpg', '/src/images/img19.jpg', '/src/images/img20.jpg', '/src/images/img21.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        OFFLINE_URL,
        '/vite.svg',
        ...IMAGE_ASSETS,
        // Add CSS/JS bundles (Vite outputs to /assets)
        '/assets/index.css',
        '/assets/index.js',
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Background sync for failed POST requests (orders)
const ORDER_QUEUE = 'order-queue';

// Utility: IndexedDB wrapper for queue
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ematernity-pwa', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(ORDER_QUEUE)) {
        db.createObjectStore(ORDER_QUEUE, { autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function queueOrder(data) {
  return openDB().then((db) => {
    const tx = db.transaction(ORDER_QUEUE, 'readwrite');
    tx.objectStore(ORDER_QUEUE).add(data);
    return tx.complete;
  });
}

function getQueuedOrders() {
  return openDB().then((db) => {
    return new Promise((resolve) => {
      const tx = db.transaction(ORDER_QUEUE, 'readonly');
      const store = tx.objectStore(ORDER_QUEUE);
      const orders = [];
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          orders.push({ key: cursor.key, value: cursor.value });
          cursor.continue();
        } else {
          resolve(orders);
        }
      };
    });
  });
}

function deleteQueuedOrder(key) {
  return openDB().then((db) => {
    const tx = db.transaction(ORDER_QUEUE, 'readwrite');
    tx.objectStore(ORDER_QUEUE).delete(key);
    return tx.complete;
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Cache API responses for /api/products and /api/categories
  if (
    event.request.url.includes('/api/products') ||
    event.request.url.includes('/api/categories') ||
    event.request.url.includes('/api/orders') ||
    event.request.url.includes('/api/account') ||
    event.request.url.includes('/api/wishlist')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cache.match(event.request));
      })
    );
    return;
  }
  // Intercept failed POST /api/orders and queue for background sync
  if (event.request.method === 'POST' && event.request.url.includes('/api/orders')) {
    event.respondWith(
      fetch(event.request.clone()).catch(() => {
        event.request.clone().json().then((body) => {
          queueOrder({ url: event.request.url, body });
        });
        return new Response(JSON.stringify({
          offline: true,
          message: 'Order queued and will be sent when back online.'
        }), { status: 202, headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        return response || caches.match(OFFLINE_URL);
      });
    })
  );
});

// Listen for sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      getQueuedOrders().then((orders) => {
        return Promise.all(orders.map(({ key, value }) => {
          return fetch(value.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(value.body),
          }).then((res) => {
            if (res.ok) deleteQueuedOrder(key);
          });
        }));
      })
    );
  }
});

// Push notification support
self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'Everything Maternity';
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: data.url ? { url: data.url } : {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
}); 