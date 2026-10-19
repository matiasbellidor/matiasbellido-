/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! ADVERTENCIA !!
    // Esto permite que el build termine exitosamente aunque
    // tu proyecto tenga errores de TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Esto ignora los errores de ESLint durante el build.
    ignoreDuringBuilds: true,
  },
  images: {
    // next/image sirve AVIF (más liviano) y cae a WebP si el navegador no lo soporta.
    formats: ["image/avif", "image/webp"],
    // Breakpoints acotados a los tamaños reales del layout → menos variantes, caché más eficiente.
    // 512: escalón intermedio para la foto del Hero y las tarjetas (antes saltaban de 414 a 640).
    deviceSizes: [360, 414, 512, 640, 768, 1024, 1280, 1920],
    imageSizes: [56, 96, 112, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}

module.exports = nextConfig
