import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/guide", "/contact", "/privacy", "/terms"],
      disallow: ["/new", "/settings", "/case/"],
    },
    sitemap: "https://proseprime.com/sitemap.xml",
  };
}
