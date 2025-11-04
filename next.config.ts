/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  // 👇 Fix build su Vercel (disabilita LightningCSS)
  experimental: {
    optimizeCss: false,
  },
}

export default nextConfig
