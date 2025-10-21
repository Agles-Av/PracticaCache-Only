// ===== A) CONFIGURACIÓN
const CACHE_NAME = 'cocktail-pwa-v2';

// App Shell (debe abrir offline sí o sí)
const APP_SHELL = [
  '/',
  '/index.html',
  '/main.js',
  '/styles/main.css',
  '/scripts/app.js',
];

// Fallback si no hay red para la API
const OFFLINE_COCKTAIL_JSON = {
  drinks: [{
    idDrink: '00000',
    strDrink: '🚫 ¡Sin Conexión ni Datos Frescos!',
    strTags: 'FALLBACK',
    strCategory: 'Desconectado',
    strInstructions: 'No pudimos obtener resultados. Intenta reconectar.',
    strDrinkThumb: 'https://via.placeholder.com/200x300?text=OFFLINE',
    strIngredient1: 'Service Worker',
    strIngredient2: 'Fallback JSON'
  }]
};

// ===== B) INSTALL: Precache del App Shell
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando y precacheando App Shell…');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()) // activa versión nueva sin esperar
  );
});

// ===== C) ACTIVATE: Limpieza de caches viejos (higiene)
self.addEventListener('activate', (event) => {
  console.log('[SW] Activado. Limpiando versiones antiguas…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ===== D) FETCH: Estrategias
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- Estrategia 1: Cache-Only para App Shell
  const isAppShell = APP_SHELL.some(asset =>
    url.pathname === asset || url.pathname === asset.replace(/^\//, '')
  );

  if (isAppShell) {
    event.respondWith(
      caches.match(event.request).then(resp =>
        resp || new Response('App Shell asset missing', { status: 500 })
      )
    );
    return;
  }

  // --- Estrategia 2: Network-First con fallback JSON para la API
  const isCocktailApi = url.host === 'www.thecocktaildb.com' &&
                        url.pathname.includes('/search.php');

  if (isCocktailApi) {
    event.respondWith(
      fetch(event.request) // primero la red
        .catch(() => new Response(JSON.stringify(OFFLINE_COCKTAIL_JSON), {
          headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }

  // Otros recursos → comportamiento por defecto (red)
});
