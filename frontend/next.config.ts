import createNextIntlPlugin from 'next-intl/plugin';

// Verknüpft das Plugin mit unserer erstellten Datei
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);