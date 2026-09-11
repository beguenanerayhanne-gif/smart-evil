import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images served from Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
    ],
  },
  // Increase body size limit for image uploads via Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
