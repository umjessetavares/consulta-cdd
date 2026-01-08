const CACHE_NAME = 'cdd-cache-v20';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './dados_cdd.js',
  './dados_cdu.js',
  './manifest.json',
  './icon-192.png'
];

// 1 INSTALAÇÃO
self.addEventListener('install', (event) => {
  // Força o SW a "pular a fila" e instalar imediatamente
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// 2 ATIVAÇÃO E LIMPEZA
self.addEventListener('activate', (event) => {
  // Toma o controle da página imediatamente, sem precisar recarregar
  event.waitUntil(clients.claim());

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

// 3 INTERCEPTAÇÃO (Estratégia: Network First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a internet funcionou:
        // 1 Clona a resposta (porque ela só pode ser lida uma vez)
        const responseToCache = networkResponse.clone();
        
        // 2 Atualiza o cache automaticamente com a versão nova
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        // 3 Entrega a versão da internet para o usuário
        return networkResponse;
      })
      .catch(() => {
        // Se a internet falhou (OFFLINE):
        // Retorna o que estiver salvo no cache
        return caches.match(event.request);
      })
  );
});
