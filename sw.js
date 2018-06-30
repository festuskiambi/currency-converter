/*jshint esversion: 6 */
const cacheName = 'static-assets-v1';
const staticAssets = [
    './',
    './app.js',
    './styles.css',
    './index.html',
    './images/money.svg',
    "https://free.currencyconverterapi.com/api/v5/currencies"
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(staticAssets))
    );
});

self.addEventListener('activate', event => {

});
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cacheResponse => {
            return cacheResponse || fetch(event.request);
        })
    );

});