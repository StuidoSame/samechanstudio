import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep public policy URLs, including the Google Play deletion URL,
  // canonical and directly accessible with a trailing slash.
  trailingSlash: true,
};

export default nextConfig;
