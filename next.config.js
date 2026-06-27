/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",        // generates a static `out/` folder — no server needed
  trailingSlash: true,     // required for Netlify static routing
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
