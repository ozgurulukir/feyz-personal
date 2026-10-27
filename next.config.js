/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.airtableusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'dl.airtable.com'
      }
    ]
  }
}

module.exports = nextConfig
