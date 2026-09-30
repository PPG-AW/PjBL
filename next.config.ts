import type { NextConfig } from "next";

const isCloudflare = process.env.CLOUDFLARE_WORKERS === "1";

const nextConfig: NextConfig = {
  // Optimasi gambar Next.js butuh binding Cloudflare Images khusus di Workers,
  // jadi saat build untuk Cloudflare kita matikan (Vercel tetap dioptimasi).
  images: isCloudflare ? { unoptimized: true } : undefined,
};

export default nextConfig;
