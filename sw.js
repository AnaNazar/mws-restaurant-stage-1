// Service Worker - Current cache name
var currentCacheName = 'restaurant-reviews-01';

// Service Worker - Install State
// Cache assets
self.addEventListener('install', function(event) {
	event.waitUntil(
    	caches.open(currentCacheName).then(function(cache) {
    		return cache.addAll([
    			'/',
				'css/styles.css',
				'data/restaurants.json',
				'js/dbhelper.js',
				'js/main.js',
				'js/restaurant_info.js',
				'js/swController.js',
    		]);
    	})
	);
});

// Service Worker - Activate State
self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter(function(cacheName) {
					return cacheName.startsWith('restaurant-reviews') && cacheName != currentCacheName;
				}).map(function(cacheName) {
					return caches.delete(cacheName);
				})
			);
		})
	);
});

// Service Worker - Fetch
self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request)
			.then(response => {
				if (response) {
					return response;
				}
				return fetch(event.request)
				// Add fetched files to the cache
					.then(response => {
						return caches.open(currentCacheName).then(cache => {
							cache.put(event.request.url, response.clone());
							return response;
						});
					});
			})
	);
});