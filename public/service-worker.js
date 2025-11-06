/**
 * Service Worker for AI Photo Gallery
 * Gestisce la cache e la pulizia forzata quando l'admin aggiorna i dati
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `gallery-cache-${CACHE_VERSION}`;

// File da cachare durante l'installazione
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Installa il Service Worker e crea la cache
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // Forza l'attivazione immediata
      return self.skipWaiting();
    })
  );
});

// Attiva il Service Worker e pulisci vecchie cache
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Prendi il controllo di tutte le pagine immediatamente
      return self.clients.claim();
    })
  );
});

// Intercetta le richieste di rete
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Non cachare richieste API, Firestore, Storage
  if (
    url.pathname.startsWith('/api-proxy') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('storage.googleapis.com') ||
    url.hostname.includes('generativelanguage.googleapis.com')
  ) {
    // Network only per API con gestione errori
    event.respondWith(
      fetch(request).catch((error) => {
        console.warn('[Service Worker] Network error for API request:', request.url, error);
        return new Response('Network error', { 
          status: 503, 
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
    return;
  }

  // Strategia: Network First, fallback to Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Verifica che la risposta sia valida
        if (!response || response.status === 0) {
          throw new Error('Invalid response');
        }
        
        // Clona la risposta perché può essere usata solo una volta
        const responseClone = response.clone();
        
        // Casha solo risposte valide (200-299)
        if (response.ok && response.status >= 200 && response.status < 300) {
          caches.open(CACHE_NAME).then((cache) => {
            // Verifica che la richiesta sia cachabile
            if (request.method === 'GET' && !request.url.includes('?')) {
              cache.put(request, responseClone).catch((cacheError) => {
                console.warn('[Service Worker] Cache put failed:', cacheError);
              });
            }
          }).catch((cacheError) => {
            console.warn('[Service Worker] Cache open failed:', cacheError);
          });
        }
        
        return response;
      })
      .catch((fetchError) => {
        console.warn('[Service Worker] Fetch failed:', request.url, fetchError);
        
        // Se la rete fallisce, prova dalla cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', request.url);
            // Verifica che la risposta sia valida prima di restituirla
            try {
              if (cachedResponse.ok && cachedResponse.status >= 200 && cachedResponse.status < 400) {
                return cachedResponse;
              } else {
                console.warn('[Service Worker] Invalid cached response, skipping cache');
                throw new Error('Invalid cached response');
              }
            } catch (error) {
              console.warn('[Service Worker] Error reading cached response:', error);
              // Rimuovi la risposta corrotta dalla cache
              caches.open(CACHE_NAME).then(cache => cache.delete(request));
              throw error;
            }
          }
          
          // Se non c'è in cache, gestisci in base al tipo di richiesta
          if (request.destination === 'document') {
            // Per documenti HTML, prova a servire index.html
            return caches.match('/index.html').then((indexResponse) => {
              if (indexResponse) {
                return indexResponse;
              }
              return new Response('Offline - Page not available', { 
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html' }
              });
            });
          }
          
          // Per altri tipi di richieste
          if (request.destination === 'image') {
            return new Response('Image not available', { 
              status: 404,
              statusText: 'Not Found',
              headers: { 'Content-Type': 'text/plain' }
            });
          }
          
          return new Response('Resource not available', { 
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        }).catch((cacheError) => {
          console.error('[Service Worker] Cache match failed:', cacheError);
          return new Response('Service Worker error', { 
            status: 500,
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});

// Ascolta messaggi dal client per pulire la cache
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  try {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
      console.log('[Service Worker] Clearing all caches...');
      
      event.waitUntil(
        caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              console.log('[Service Worker] Deleting cache:', cacheName);
              return caches.delete(cacheName).catch((deleteError) => {
                console.warn('[Service Worker] Failed to delete cache:', cacheName, deleteError);
              });
            })
          );
        }).then(() => {
          // Ricrea la cache con gli asset statici
          return caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Recreating cache with static assets');
            return cache.addAll(STATIC_ASSETS).catch((addError) => {
              console.warn('[Service Worker] Failed to add static assets to cache:', addError);
            });
          });
        }).then(() => {
          // Notifica tutti i client che la cache è stata pulita
          return self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              try {
                client.postMessage({
                  type: 'CACHE_CLEARED',
                  timestamp: Date.now()
                });
              } catch (messageError) {
                console.warn('[Service Worker] Failed to send message to client:', messageError);
              }
            });
          });
        }).catch((error) => {
          console.error('[Service Worker] Cache clear operation failed:', error);
        })
      );
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  } catch (error) {
    console.error('[Service Worker] Message handler error:', error);
  }
});

console.log('[Service Worker] Loaded');

