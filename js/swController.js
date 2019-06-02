/**
 * SERVICE WORKER
 * Set up the cache feature for all visited pages
 */
// Verify whether the browser supports service workers
if (navigator.serviceWorker) {
	// Registration
	navigator.serviceWorker.register('/sw.js');
}