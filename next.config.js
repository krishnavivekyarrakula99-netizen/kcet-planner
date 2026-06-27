/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Don't block the build/dev on lint warnings
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
