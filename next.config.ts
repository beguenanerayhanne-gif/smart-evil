import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images served from Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        // Matches any Supabase project domain: *.supabase.co
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
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
