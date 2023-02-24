
self.addEventListener('install', function(event) {
  // console.log('Service Worker - Installing', event);
  event.waitUntil(
    caches.open('static-17').then(function(cache) {
      console.log('Precacheamento');
      cache.addAll([
        '/',
        '/index.html',
        '/src/images/background-2.jpeg',
        '/src/css/bootstrap.min.css',
        '/src/css/style.css',
        '/src/js/app.js',
        '/src/js/bootstrap.min.js',
        '/src/js/createPost.js',
      ]);
    })
  )
});

self.addEventListener('activate', function(event) {
  // console.log('Service Worker - Activating', event);
});

self.addEventListener('fetch', function(event) {
  // console.log('Service Worker - Fetching', event);

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open('dynamic')
                .then(function(cache) {
                  cache.put(event.request.url, res.clone())
                  return res;
                })
            })
            .catch(function (err) {
              cconsole.log(err);
            })
        }
    })
  )
});