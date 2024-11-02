module.exports = {
  // ...existing code...
  webpack: (config, { isServer }) => {
    // ...existing code...
    if (!isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          message: /Failed to parse source map/,
        },
      ];
    }
    return config;
  },
};
