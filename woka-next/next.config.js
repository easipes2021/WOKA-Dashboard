/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/woka-dashboard/woka-next",
  assetPrefix: "/woka-dashboard/woka-next/",
};

module.exports = nextConfig;
