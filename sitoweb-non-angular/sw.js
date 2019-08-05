const STATIC_CACHE_NAME = 'static-cache-v2'
const STATIC_CACHE_ASSETS = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/materialize.min.js',
    '/css/style.css',
    '/css/materialize.min.css',
    '/img/icons/logo-72x72.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    '/pagine/fallback.html'
]

self.addEventListener('install', event => {
    //console.log('Service worker installato', event)

    event.waitUntil(caches.open(STATIC_CACHE_NAME).then(chace => {
        console.log('Preparo la cache')
        chace.addAll(STATIC_CACHE_ASSETS)
    }))
})

self.addEventListener('activate', event => {
    //console.log('Service worker attivato', event)

    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                .map(key => caches.delete(key))
            )
        })
    )
})

self.addEventListener('fetch', event => {
    //console.log('richiesta fetch intercettata', event)

    event.respondWith(
        caches.match(event.request).then(cacheRes => {
            return cacheRes || fetch(event.request)
        }).catch(() => {
            if(event.request.url.indexOf('.html') > -1){
                return caches.match('/pagine/fallback.html')
            } 
        })
    )
})