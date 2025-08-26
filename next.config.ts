import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // output: 'standalone', // コメントアウト - standaloneモード無効化
    trailingSlash: true,
    images: {
        unoptimized: true
    }
  /* config options here */
};

export default nextConfig;
