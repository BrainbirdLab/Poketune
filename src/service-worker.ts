/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version} from '$service-worker';
import { precacheAndRoute, precache } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;


precacheAndRoute([
	...build.map((file) => ({ url: file, revision: null })),
	...files.map((file) => ({ url: file, revision: version })),
]);

const routes = [
	'/',
	'guitar',
	'bass',
	'ukulele',
	'chromatic',
	'metronome',
];

precache([
	...routes.map((route) => ({ url: route, revision: version })),
]);



self.addEventListener('message', (e) => {
	//console.log(e.data);
	if (e.data && e.data.type === 'SKIP_WAITING') {
		console.log('Service Worker: Updated');
		self.skipWaiting();
	}
});


const matchCb = ({ url, request }) => {
	//console.log(url, request);
	return routes.some(path => url.pathname === path);
};

registerRoute(matchCb, new StaleWhileRevalidate());