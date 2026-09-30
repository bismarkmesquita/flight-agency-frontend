import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    // Always defined so it is inlined as a constant: with the flag off, the mock API's
    // dynamic imports become dead code and are left out of the bundle.
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK ?? 'false',
  },
  sassOptions: {
    includePaths: ['src'],
    additionalData: `@use "@/base/styles/index.scss" as *;`,
  },
};

export default nextConfig;
