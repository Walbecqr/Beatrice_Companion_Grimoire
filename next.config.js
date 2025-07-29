/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // For Docker deployment
  output: 'standalone',
}

module.exports = nextConfig