importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');


var STATIC_CACHE = 'static-53';
var DYNAMIC_CACHE = 'dynamic';

self.addEventListener('install', function(event) {
  // console.log('Service Worker - Installing', event);
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      console.log('Precacheamento');
      cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
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

  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        var promises = keyList.map(function (key) {
          if ((key !== STATIC_CACHE) && (key !== DYNAMIC_CACHE)) { 
            return caches.delete(key);
          }
        })
      
        return Promise.all(promises);
      })
  );

  return self.clients.claim();
});



self.addEventListener('fetch', function(event) {
  // console.log('Service Worker - Fetching', event);
  var URL = 'http://localhost:3000/posts';

  if (event.request.url.indexOf(URL) > - 1) {
    console.log('é minha URL');
    event.respondWith(
      fetch(event.request)
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          for (var key in data) {
            console.log(data[key]);
            writeData('posts', data[key]);
          }

          return res;
        })
    )
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function(res) {
                // console.log(URL);
                // console.log(event.request);
                return caches.open(DYNAMIC_CACHE)
                  .then(function(cache) {
                    cache.put(event.request.url, res.clone())
                    return res;
                  })
              })
              .catch(function (err) {
                // console.log(err);
                return caches.open(STATIC_CACHE)
                  .then(function (cache) {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offline.html');
                    }
                  })
              })
          }
      })
    )
  }

  
});