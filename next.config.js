/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./next-intl.config.js');

const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = withNextIntl(nextConfig);
