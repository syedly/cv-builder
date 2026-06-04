/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose', 'pdf-parse', 'mammoth'],
  turbopack: {},
};

module.exports = nextConfig;
