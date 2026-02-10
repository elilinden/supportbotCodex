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
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
