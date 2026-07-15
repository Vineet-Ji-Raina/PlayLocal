/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export
  output: 'export',

  // Required for static export (no server-side image optimization)
  images: {
    unoptimized: true,
  },

  // Optional: Helps with routing on static hosts
  trailingSlash: true,

  // Optional: Change output directory (default is 'out')
  // distDir: 'out',
};

export default nextConfig;