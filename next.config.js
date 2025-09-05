/** @type {import('next').NextConfig} */
const nextConfig = {
    // Standalone mode for Azure App Service
    output: 'standalone',
    
    // Azure App Service 最適化設定
    trailingSlash: false,
    images: {
        unoptimized: true,
        domains: []
    },
    compress: true,
    generateEtags: false,
    poweredByHeader: false,
    
    // CSS最適化設定（Azure対応）
    experimental: {
        optimizeCss: false,
    },
    
    // 環境変数を明示的にクライアントサイドに公開
    env: {
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    }
};

module.exports = nextConfig;
