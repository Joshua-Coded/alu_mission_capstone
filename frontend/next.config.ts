/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: false,

  experimental: {
    turbo: {
      rules: {
        '*.js': {
          browser: true,
        },
      },
    },
  },

  // API Rewrites to fix CORS issues
  async rewrites() {
    return [
      // Proxy API calls to your backend
      {
        source: '/api/backend/:path*',
        destination: 'https://rootrise.onrender.com/api/v1/:path*',
      },
      // Alternative proxy for specific endpoints
      {
        source: '/api/proxy/:path*',
        destination: 'https://rootrise.onrender.com/api/v1/:path*',
      },
    ];
  },

  // ✅ ENHANCED: Headers with WalletConnect CSP support
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // ✅ FIXED: Enhanced CSP for WalletConnect and RainbowKit
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://walletconnect.com https://api.web3modal.org",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https: wss: https://rootrise.onrender.com https://walletconnect.com https://api.web3modal.org https://pulse.walletconnect.org",
              "img-src 'self' https: data: blob:",
              "font-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; '),
          },
        ],
      },
      // CORS headers for API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'res.cloudinary.com',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    emotion: true,
  },

  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    dirs: ['src', 'app', 'components', 'lib', 'utils'],
  },

  poweredByHeader: false,
};

module.exports = withBundleAnalyzer(nextConfig);