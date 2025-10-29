/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  productionBrowserSourceMaps: false,

  // Webpack optimizations
  webpack: (config: { resolve: { fallback: any; }; plugins: any[]; optimization: any; }, { isServer, webpack }: any) => {
    // Fix pino-pretty missing module warning
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        'pino-pretty': false,
      };
    }

    // Ignore optional dependencies
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(pino-pretty|encoding|bufferutil|utf-8-validate)$/,
      })
    );

    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          
          // Framework
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          
          // Web3
          web3: {
            name: 'web3',
            test: /[\\/]node_modules[\\/](wagmi|@wagmi|@rainbow-me|viem|@walletconnect|@tanstack)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          
          // Chakra UI
          chakra: {
            name: 'chakra',
            test: /[\\/]node_modules[\\/](@chakra-ui|@emotion)[\\/]/,
            priority: 25,
            reuseExistingChunk: true,
          },
          
          // UI libraries
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/](framer-motion|lucide-react|react-icons)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
          
          // Utilities
          lib: {
            name: 'lib',
            test: /[\\/]node_modules[\\/](axios|date-fns|formik|react-hook-form|yup)[\\/]/,
            priority: 15,
            reuseExistingChunk: true,
          },
          
          // Commons
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
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

  // Headers (keeping your existing CSP + adding optimizations)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              process.env.NODE_ENV === 'development'
                ? "connect-src 'self' http://localhost:3001 https: wss:"
                : "connect-src 'self' https: wss:",
              "img-src 'self' https: data: blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
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