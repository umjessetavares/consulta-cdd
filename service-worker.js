const CACHE_NAME = 'cdd-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './dados.js',
  './manifest.json'
  // Adicione aqui o caminho do ícone se tiver (ex: './icon-192.png')
];

// Instalação: Cache inicial dos arquivos essenciais

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

// Ativação: Limpeza de caches antigos (útil quando você muda a versão)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições: Busca no Cache primeiro, depois na Rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrou no cache, retorna o cache
        if (response) {
          return response;
        }
        // Se não, busca na rede
        return fetch(event.request);
      })
  );
});
