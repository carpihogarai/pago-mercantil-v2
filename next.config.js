/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Esto asegura que la carpeta `out` no se genere, ya que no es compatible
  // con las API Routes que necesitamos.
  output: 'standalone',

  // Redirige las peticiones del lado del cliente desde /api hacia el backend de Flask
  // Esto solo se aplica en desarrollo (npm run dev).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:5000/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;