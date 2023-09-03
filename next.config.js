/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['badfoxmc.com'],
  },
  webpack: function (config, options) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }
    return config
  },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'https://firebasestorage.googleapis.com/:path*',
      },
    ]
  },
}

module.exports = nextConfig
