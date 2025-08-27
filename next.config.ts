import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    basePath: ''
};

export default nextConfig;
