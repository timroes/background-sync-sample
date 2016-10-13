self.importScripts('/libs/pouchdb/dist/pouchdb.min.js');

const db = new PouchDB('outbox');

self.addEventListener('sync', ev => {
	console.info("Received sync event in service worker.");
	// This sync event should wait until (take as long as) all messages
	// are synced to server
	ev.waitUntil(
		// Receive all messages cached in IndexDB
		db.allDocs({ include_docs: true })
		.then(result => {
			return result.rows.map(row => {
				// Send each message via POST to the backend, should of course use batch
				// in the "real world"
				return fetch('/message', {
					method: 'POST',
					headers: new Headers({
						'content-type': 'application/json; charset=UTF-8'
					}),
					body: JSON.stringify(row.doc)
				}).then(() => {
					// Remove the document from the IndexDB, since it doesn't need to be sent
					// to the server anymore
					return db.remove(row.doc);
				});
			});
		})
		.then(fetchPromises => {
			// Wait for all of the above requests to finish
			return Promise.all(fetchPromises);
		})
	);
});

// Make webpage offline available the most simplest way
self.addEventListener('install', ev => {
	ev.waitUntil(caches.open('cache-v1').then(cache => {
		return cache.addAll([
			'/',
			'index.html',
			'app.js',
			'styles.css',
			'socket.io/socket.io.js',
			'libs/jquery/dist/jquery.min.js',
			'libs/pouchdb/dist/pouchdb.min.js'
		]);
	}));
});

self.addEventListener('fetch', ev => {
	ev.respondWith(caches.match(ev.request).then(resp => {
		return resp || fetch(ev.request);
	}));
});
