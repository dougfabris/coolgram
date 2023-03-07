importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var API_URL = 'http://localhost:3000/posts';
var STATIC_CACHE = 'static-73';
var DYNAMIC_CACHE = 'dynamic';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/images/background-2.jpeg',
  '/src/css/bootstrap.min.css',
  '/src/css/style.css',
  '/src/js/app.js',
  '/src/js/bootstrap.min.js',
  '/src/js/createPost.js',
]

self.addEventListener('install', function(event) {
  // console.log('Service Worker - Installing', event);

  event.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      console.log('Precacheamento');
      cache.addAll(STATIC_FILES);
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

function isInArray(string, array) {
  var cachedPath;
  if (string.indexOf(self.origin) === 0) {
    cachedPath = string.substring(self.origin.length);
  } else {
    cachedPath = string;
  }
  return array.indexOf(cachedPath) > -1;
}

self.addEventListener('fetch', function(event) {
  // console.log('Service Worker - Fetching', event);
  
  if (event.request.url.indexOf(API_URL) > - 1) {
    event.respondWith(fetch(event.request)
      .then(function (res) {
        var clonedRes = res.clone();
        clearAllData('posts')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeData('posts', data[key])
            }
          })
        return res;
      })
    )
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function(res) {
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

self.addEventListener('sync', function(event) {
  console.log('Background Syncing', event);

  if (event.tag === 'sync-new-posts') {
    console.log('Syncing new post');
    event.waitUntil(
      readAllData('sync-posts')
        .then(function (data) {
          for (var stPost of data) {
            fetch(API_URL, {
              method: 'POST',
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                id: stPost.id,
                title: stPost.title,
                description: stPost.description,
                image: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/golden-retriever-royalty-free-image-506756303-1560962726.jpg',
              })
            })
              .then(function(res) {
                console.log('Data was sent', res);
                if (res.ok) {
                  res.json()
                    .then(function (resData) {
                      deleteItemFromData('sync-posts', resData.id)
                    })
                }
              })
              .catch(function(error) {
                console.log('Error while posting sync', error)
              })
          }
        })
    )
  }
});

self.addEventListener('notificationclick', function(event) {
  var action = event.action;

  if (action === 'confirm') {
    return location.href = './help.html';
  }
})