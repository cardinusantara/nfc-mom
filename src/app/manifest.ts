import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cardi NFC - Digital Business Card',
    short_name: 'Cardi NFC',
    description: 'Kartu bisnis digital dan manajemen kontak pintar berbasis AI Cardi',
    start_url: '/',
    display: 'standalone',
    background_color: '#070D1E',
    theme_color: '#1E4FFF',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}

