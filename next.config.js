/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: 'standalone',


    // Disable ESLint during build - FIX FOR VERCEL
    eslint: {
        ignoreDuringBuilds: false,
    },

    // Disable TypeScript checking for Vercel build
    typescript: {
        ignoreBuildErrors: false,
    },

    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
