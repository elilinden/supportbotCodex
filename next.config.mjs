/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optimize images: allow common external hosts and enable modern formats
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Bundle analyzer (opt-in via ANALYZE=true)
  ...(process.env.ANALYZE === "true"
    ? { experimental: { optimizePackageImports: ["zod", "zustand"] } }
    : {}),

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
