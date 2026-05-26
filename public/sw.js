import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({ cacheName: 'fluum-pages' })
)

registerRoute(
  ({ url }) => /\.(js|css|png|woff2)$/.test(url.pathname),
  new CacheFirst({ cacheName: 'fluum-assets' })
)
