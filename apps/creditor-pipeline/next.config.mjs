import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@rescue-ops/shared", "@rescue-ops/database"],
  serverExternalPackages: ["@prisma/client"],
  experimental: { esmExternals: "loose" },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  disableLogger: true,
});
