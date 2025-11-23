/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Empêche le build de planter à cause de types, mais affiche quand même les erreurs.
    ignoreBuildErrors: false
  },
  eslint: {
    // Pareil : si tu veux déployer même avec quelques warnings, tu peux passer à true
    ignoreDuringBuilds: false
  }
};

module.exports = nextConfig;
