import createNextIntlPlugin from 'next-intl/plugin';

// Verknüpft das Plugin mit unserer erstellten Datei
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const apiUrl = backendBase.endsWith('/api') ? backendBase : `${backendBase}/api`;
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`
      }
    ];
  }
};

export default withNextIntl(nextConfig);