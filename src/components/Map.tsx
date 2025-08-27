// 修正 by M. Tanabe - Google Maps統合コンポーネント新規作成
'use client';
import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapProps {
  address: string;
  spaceName: string;
}

export default function Map({ address, spaceName }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // まず環境変数から試す
        let apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        // 環境変数で取得できない場合はAPIから取得
        if (!apiKey) {
          console.log('Fetching API key from server...');
          const response = await fetch('/api/maps-key');
          if (response.ok) {
            const data = await response.json();
            apiKey = data.apiKey;
          }
        }
        
        console.log('Google Maps API Key available:', !!apiKey);
        
        if (!apiKey) {
          console.error('Google Maps API key is not available');
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
        });

        const google = await loader.load();
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0] && mapRef.current) {
            const map = new google.maps.Map(mapRef.current, {
              center: results[0].geometry.location,
              zoom: 15,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            });

            new google.maps.Marker({
              map,
              position: results[0].geometry.location,
              title: spaceName,
            });
          } else {
            console.error('住所の変換に失敗しました:', address, status);
          }
        });
      } catch (error) {
        console.error('Google Maps loader error:', error);
      }
    };

    if (address) {
      initMap();
    }
  }, [address, spaceName]);

  // 修正 by M. Tanabe - レスポンシブ対応
  return (
    <div className="w-full h-48 md:h-64 lg:h-80 rounded-lg overflow-hidden border">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
// 修正 by M. Tanabe - 終了
