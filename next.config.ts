import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // output: 'standalone', // コメントアウト - standaloneモード無効化
    trailingSlash: false,
    images: {
        unoptimized: true
    },
    compress: true,
    generateEtags: false,
    poweredByHeader: false
  /* config options here */
};

export default nextConfig;
