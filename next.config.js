/** @type {import('next').NextConfig} */
const nextConfig = {
    // Azure App Service 最適化設定
    trailingSlash: false,
    images: {
        unoptimized: true,
        domains: []
    },
    compress: true,
    generateEtags: false,
    poweredByHeader: false,
    // Azure での静的ファイル配信最適化
    assetPrefix: '',
    basePath: '',
    // 環境変数を明示的にクライアントサイドに公開
    env: {
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    }
};

module.exports = nextConfig;
