import { withContentlayer } from "next-contentlayer2";
import createNextIntlPlugin from "next-intl/plugin";
import nextPWA from "next-pwa";

const withNextIntl = createNextIntlPlugin();

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "unavatar.io",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "email-attachment.Mail1s.net",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "Mail1s.net",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
    // serverActions: {
    //   allowedOrigins: ["localhost:3000", process.env.NEXT_PUBLIC_APP_URL],
    // },
  },
  rewrites() {
    return [
      {
        source: "/logo.png",
        destination: "/_static/logo.png",
      },
    ];
  },
  redirects() {
    return [
      {
        source: "/s",
        destination: "/",
        permanent: true,
      },
      {
        source: "/docs/developer",
        destination: "/docs/developer/installation",
        permanent: true,
      },
      {
        source: "/0",
        destination: "https://Mail1s.net/s/0",
        permanent: true,
      },
      {
        source: "/9",
        destination: "https://Mail1s.net/s/9",
        permanent: true,
      },
      {
        source: "/ai",
        destination: "https://Mail1s.net/s/ai?ref=wrdo",
        permanent: true,
      },
      {
        source: "/cps",
        destination: "https://Mail1s.net/s/cps",
        permanent: true,
      },
      {
        source: "/x",
        destination: "https://Mail1s.net/s/x",
        permanent: true,
      },
      {
        source: "/solo",
        destination: "https://Mail1s.net/s/solo",
        permanent: true,
      },
      {
        source: "/rmbg",
        destination: "https://Mail1s.net/s/rmbg",
        permanent: true,
      },
      {
        source: "/llk",
        destination: "https://Mail1s.net/s/llk",
        permanent: true,
      },
    ];
  },
};

const withPWA = nextPWA({
  dest: "public",
  disable: false,
});

export default withContentlayer(withPWA(withNextIntl(nextConfig)));
