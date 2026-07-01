/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages are shipped as TS source; let Next transpile them.
  transpilePackages: ['@barriapp/shared', '@barriapp/api-client'],
};

export default nextConfig;
