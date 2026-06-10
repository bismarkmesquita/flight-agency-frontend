import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: ['src'],
    additionalData: `@use "@/base/styles/index.scss" as *;`,
  },
};

export default nextConfig;
