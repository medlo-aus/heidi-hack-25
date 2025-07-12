/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  // Allow optimizing avatar images from GitHub
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
  // transpilePackages: ["geist"],
  transpilePackages: [
    "@heidi/api",
    "@heidi/db",
    "@heidi/ui",
    "@heidi/validators",
  ],
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty-module.ts',
      },
    },
    webpack: (config) => {
      /**
       * Critical: prevents " ⨯ ./node_modules/canvas/build/Release/canvas.node
       * Module parse failed: Unexpected character '�' (1:0)" error
       */
      config.resolve.alias.canvas = false;

      return config;
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default config;
