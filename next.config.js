/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ant-design/icons', '@ant-design/icons-svg', 'rc-util', 'rc-pagination', 'rc-picker', 'rc-table', 'rc-tree', 'antd'],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
  // Add this configuration
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          '@ant-design/icons/lib/dist$': '@ant-design/icons/lib/index.es.js',
        },
      },
    }
  },
};

module.exports = nextConfig;
