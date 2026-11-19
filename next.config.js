/** @type {import('next').NextConfig} */
const nextConfig = {
  // El build no corre tsc ni ESLint: `npx tsc --noEmit` se corre a mano
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ["image/avif", "image/webp"],
    // Acotados a los anchos reales del layout: menos variantes por imagen.
    // 512: escalón intermedio para la foto del Hero y las tarjetas.
    deviceSizes: [360, 414, 512, 640, 768, 1024, 1280, 1920],
    imageSizes: [56, 96, 112, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

module.exports = nextConfig;
