console.log('sw', this)
// Make a list of things to cache.
const thingsToCache = [
  '/',
  '/manifest.json',
  '/index.html',
  '/css/main.css',
  '/js/index.js',
]

// Let's name our active cache.
const activeCache = 'myApp'

// This function fetches a request and adds its response to the cache for later. :D
const fetchAndCache = (request) =>
  fetch(request).then((response) => {
    caches.open(activeCache).then((cache) => {
      cache.put(request, response)
    })

    return response.clone()
  })

/*
  This function checks the cache for a cached response.
  If there isn't one, it fetches and then caches. :D
*/
const responseFromCacheOrFetchAndCache = (request) =>
  caches
    .match(request)
    .then((cachedItem) => cachedItem || fetchAndCache(request))

// On install, cache all the things!
this.addEventListener('install', (event) =>
  event.waitUntil(
    caches.open(activeCache).then((cache) => {
      caches.delete(activeCache)
      cache.addAll(thingsToCache)
    })
  )
)

self.addEventListener('activate', function (event) {
  console.log('on activate', this)
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (cacheName) {
            console.log('cacheName', cacheName)
            return true
          })
          .map(function (cacheName) {
            return caches.delete(cacheName)
          })
      )
    })
  )
})

this.addEventListener('fetch', async (event) => {
  const { request } = event
  console.log('on fetch', request.url)

  // If we're looking for books,
  if (request.url.indexOf('/novel') > -1) {
    const resp = await responseFromCacheOrFetchAndCache(request)
    // Respond with a HTML stream
    return event.respondWith(resp.body)
  }

  // If we're looking for something else (css/js/etc.), get it from the cache, or fetch it.
  return event.respondWith(responseFromCacheOrFetchAndCache(request))
})
