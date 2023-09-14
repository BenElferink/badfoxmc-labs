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
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'OPTIONS,GET,POST' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
