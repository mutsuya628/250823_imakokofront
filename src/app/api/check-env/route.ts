import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    // セキュリティのため、キーの最初の4文字のみ表示
    keyPreview: apiKey ? `${apiKey.substring(0, 4)}...` : 'Not found',
    env: process.env.NODE_ENV
  });
}
