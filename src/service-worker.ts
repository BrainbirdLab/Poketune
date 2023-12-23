/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { files, build } from "$service-worker";
import { version } from "$service-worker";

declare const self: ServiceWorkerGlobalScope;

const CACHENAME = `cache-poketune-${version}`;

const ASSETS = [
	...build, // the app files (from the build directory)
	...files, // all from 'static' dir
];

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
		console.log("Service worker Updated");
	}
});

self.addEventListener("install", (event) => {
	console.log("installed");
	async function addFilesToCache() {
		const cache = await caches.open(CACHENAME);
		await cache.addAll(ASSETS);
	}
	event.waitUntil(addFilesToCache());
});

self.addEventListener("activate", (event) => {
	console.log("activated");
	async function removeOldCache() {
		for (const key of await caches.keys()) {
			if (key !== CACHENAME) await caches.delete(key);
		}
		console.log("removed old cache");
		postMessage({ type: "CACHE_UPDATED" }, "*");
	}

	event.waitUntil(removeOldCache());
});

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;

	async function respond() {
		const cache = await caches.open(CACHENAME);
		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			//console.log(`Serving ${event.request.url} from network`);
			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				//console.log(`Serving ${event.request.url} from cache`);
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});

