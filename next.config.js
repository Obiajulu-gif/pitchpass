/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  // WDK packages ship modern ESM; let Next transpile them.
  transpilePackages: [
    "@tetherto/wdk",
    "@tetherto/wdk-wallet",
    "@tetherto/wdk-wallet-evm",
    "@tetherto/wdk-failover-provider",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "crests.football-data.org" },
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "r2.thesportsdb.com" },
      { protocol: "https", hostname: "www.thesportsdb.com" },
    ],
  },
  webpack: (config, { isServer }) => {
    // Use the pure-JS sodium shim in BOTH builds so no native addon is ever
    // loaded (the native binding breaks Next's bundled server + the browser).
    config.resolve.alias = {
      ...config.resolve.alias,
      "sodium-universal": path.resolve(__dirname, "shims/sodium-universal.js"),
    };
    if (!isServer) {
      // WDK's crypto deps don't need Node core modules in the browser.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        http: false,
        https: false,
        zlib: false,
        "bare-fs": false,
        "bare-os": false,
        "bare-path": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
