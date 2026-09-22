import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Print Made Simple — Designing | Printing | Branding',
        short_name: 'PrintMadeSimple',
        description: 'Harare commercial printing PWA: Jewel Case Calendars, business cards, banners, PRAZ RFQ portal. Offline-first, low-bandwidth.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#E30613',
        categories: ['business', 'shopping', 'productivity'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          { name: 'Jewel Case Customizer', url: '/customizer', description: 'Design your 365-day desk calendar' },
          { name: 'Request Quote (RFQ)', url: '/rfq', description: 'PRAZ-compliant B2B quote' },
          { name: 'Catalog', url: '/catalog', description: 'Browse print products' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // Cache-First: static UI assets, fonts, app shell
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'script' ||
              request.destination === 'font' ||
              request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'pms-static-v1',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            // Stale-While-Revalidate: product catalog / stock lists
            urlPattern: ({ url }) => url.pathname.startsWith('/api/catalog') || url.pathname.endsWith('.json'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'pms-catalog-v1', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 } }
          },
          {
            // Network-First with offline fallback: order dispatch / quote requests
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            options: { cacheName: 'pms-api-v1' }
          }
        ],
        navigateFallback: 'index.html'
      }
    })
  ]
})
