import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Arambha Design & Interior Studio',
        short_name: 'Arambha',
        description: 'Premium Interior Design, Furniture & Architectural Solutions in Bangalore. 35+ years of experience, 2000+ projects delivered.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F2F0EB',
        theme_color: '#8C7C62',
        icons: [
            {
                src: '/logo2.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo2.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
