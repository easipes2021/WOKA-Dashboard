/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",

  // Required for subfolder deployment
  basePath: "/woka-dashboard/woka-next",

  // Required for GitHub Pages
  trailingSlash: true,

  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
