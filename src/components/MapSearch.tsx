// 修正 by M. Tanabe - 地図検索コンポーネント新規作成
'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { searchSpaces } from '@/lib/api';

interface MapSearchProps {
  onResults: (results: SpaceResult[]) => void;
}

interface SpaceResult {
  space_id: string;
  name: string;
  city: string;
  address: string;
  wifi_mbps: number;
  private_room: boolean;
  capacity_total: number;
  category: string;
  plan: {
    plan_code: string;
    plan_name: string;
    unit_days: number;
    units: number;
    price_total: number;
    start_date: string;
    end_date: string;
  };
  coordinates?: { lat: number; lng: number };
  distance?: number;
}

interface SearchArea {
  center: { lat: number; lng: number };
  radius: number;
}

export default function MapSearch({ onResults }: MapSearchProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const currentCircleRef = useRef<google.maps.Circle | null>(null);
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchArea, setSearchArea] = useState<SearchArea | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  // 修正 by M. Tanabe - 距離フィルター機能追加
  const [searchRadius, setSearchRadius] = useState(2000); // デフォルト2km

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      console.log('MapSearch - Environment check:', {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0
      });
      
      if (!apiKey) {
        console.error('MapSearch - Google Maps API key is not available');
        console.error('MapSearch - Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable');
        return;
      }

      try {
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
        });

        const google = await loader.load();
        const geocoder = new google.maps.Geocoder();

      // 今治市の中心座標で初期化
      geocoder.geocode({ address: '今治市' }, (results, status) => {
        if (status === 'OK' && results && results[0] && mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: results[0].geometry.location,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_BOTTOM
            }
          });

          setMap(mapInstance);

                     // 地図クリックで検索エリアを設定
           mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
             const center = event.latLng;
             
             // 既存の円とマーカーを確実に削除
             if (currentCircleRef.current) {
               currentCircleRef.current.setMap(null);
               currentCircleRef.current = null;
             }
             if (currentMarkerRef.current) {
               currentMarkerRef.current.setMap(null);
               currentMarkerRef.current = null;
             }
             
             // 検索結果のマーカーもクリア
             if (window.resultMarkers) {
               window.resultMarkers.forEach((marker: google.maps.Marker) => marker.setMap(null));
               window.resultMarkers = [];
             }
             
             // 検索エリアの状態をリセット
             setSearchArea(null);

             // 新しい円を描画
             const circle = new google.maps.Circle({
               strokeColor: '#003273',
               strokeOpacity: 0.8,
               strokeWeight: 2,
               fillColor: '#003273',
               fillOpacity: 0.1,
               map: mapInstance,
               center: center,
               radius: searchRadius,
             });

             currentCircleRef.current = circle;
             setSearchArea({ center: { lat: center.lat(), lng: center.lng() }, radius: searchRadius });

             // 検索エリアの中心にマーカーを配置
             const marker = new google.maps.Marker({
               position: center,
               map: mapInstance,
               icon: {
                 url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                   <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="15" cy="15" r="12" fill="#FFEB00" stroke="#003273" stroke-width="2"/>
                     <text x="15" y="18" text-anchor="middle" font-size="10" fill="#003273" font-weight="bold">検索</text>
                   </svg>
                 `),
                 scaledSize: new google.maps.Size(30, 30),
                 anchor: new google.maps.Point(15, 15)
               }
             });

             currentMarkerRef.current = marker;
           });
        } else {
          console.error('今治市の住所変換に失敗しました:', status);
        }
      });
      } catch (error) {
        console.error('MapSearch - Google Maps loader error:', error);
      }
    };

    if (!map) {
      initMap();
    }
  }, [map, searchRadius]);

  // 半径を更新する関数
  const updateRadius = (newRadius: number) => {
    setSearchRadius(newRadius);
    
    // 既存の検索エリアがある場合、半径を更新
    if (currentCircleRef.current && searchArea) {
      currentCircleRef.current.setRadius(newRadius);
      setSearchArea({ ...searchArea, radius: newRadius });
    }
  };

  // 検索結果のマーカーをクリアする関数
  const clearResultMarkers = () => {
    if (window.resultMarkers) {
      window.resultMarkers.forEach((marker: google.maps.Marker) => marker.setMap(null));
      window.resultMarkers = [];
    }
  };

  // 検索エリアをクリアする関数
  const clearSearchArea = () => {
    if (currentCircleRef.current) {
      currentCircleRef.current.setMap(null);
      currentCircleRef.current = null;
    }
    if (currentMarkerRef.current) {
      currentMarkerRef.current.setMap(null);
      currentMarkerRef.current = null;
    }
    setSearchArea(null);
    
    // 検索結果のマーカーもクリア
    clearResultMarkers();
  };

  // 修正 by M. Tanabe - ハバーサイン公式による距離計算
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // 地球の半径（メートル）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  // 修正 by M. Tanabe - 終了

  // 住所から座標を取得する関数
  const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          resolve(null);
        }
      });
    });
  };

  // 地図上の検索エリアで物件を検索
  const searchInArea = async () => {
    if (!searchArea) {
      alert('地図上で検索エリアをクリックしてください');
      return;
    }

    setIsSearching(true);
    try {
      // 全物件を取得
      const results = await searchSpaces({
        plan_code: 'DAY',
        start_date: new Date().toISOString().split('T')[0],
        units: 1,
      });

      // 検索エリア内の物件のみフィルタリング
      const filteredResults = [];
      
      for (const item of results) {
        try {
          // 物件の住所から座標を取得
          const itemCoords = await getCoordinatesFromAddress(item.address);
          
          if (itemCoords) {
            // 検索エリアの中心からの距離を計算
            const distance = calculateDistance(
              searchArea.center.lat,
              searchArea.center.lng,
              itemCoords.lat,
              itemCoords.lng
            );
            
            // 検索半径内の物件のみ追加
            if (distance <= searchArea.radius) {
              filteredResults.push({
                ...item,
                distance: Math.round(distance), // 距離情報を追加
                coordinates: itemCoords
              });
            }
          }
        } catch (error) {
          console.warn(`物件 "${item.name}" の座標取得に失敗:`, error);
        }
      }

      // 距離順にソート
      filteredResults.sort((a, b) => a.distance - b.distance);

      onResults(filteredResults);
      
      // 検索結果を地図上に表示
      if (map && filteredResults.length > 0) {
        displayResultsOnMap(filteredResults);
      } else if (filteredResults.length === 0) {
        alert('指定されたエリア内に物件が見つかりませんでした。');
      }

    } catch (error) {
      console.error('検索エラー:', error);
      alert('検索中にエラーが発生しました');
    } finally {
      setIsSearching(false);
    }
  };

  // 検索結果を地図上に表示
  const displayResultsOnMap = (results: SpaceResult[]) => {
    if (!map) return;

    // 既存のマーカーをクリア
    if (window.resultMarkers) {
      window.resultMarkers.forEach((marker: google.maps.Marker) => marker.setMap(null));
    }

    window.resultMarkers = [];

    results.forEach((item: SpaceResult) => {
      // 座標情報の取得（latitude/longitude または coordinates から）
      const coordinates = item.coordinates || 
        (item as SpaceResult & { latitude?: number; longitude?: number }).latitude && 
        (item as SpaceResult & { latitude?: number; longitude?: number }).longitude ? 
        { 
          lat: (item as SpaceResult & { latitude?: number; longitude?: number }).latitude!, 
          lng: (item as SpaceResult & { latitude?: number; longitude?: number }).longitude! 
        } : 
        null;

      if (coordinates) {
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(coordinates.lat, coordinates.lng),
          map: map,
          title: item.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12.5" cy="12.5" r="10" fill="#003273" stroke="#FFEB00" stroke-width="1"/>
                <text x="12.5" y="16" text-anchor="middle" font-size="8" fill="#FFEB00" font-weight="bold">物件</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(25, 25),
            anchor: new google.maps.Point(12.5, 12.5)
          }
        });

        // 情報ウィンドウ（距離情報を含む）
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: Arial, sans-serif; max-width: 200px;">
              <h4 
                onclick="window.open('/reserve/${item.space_id}', '_blank')"
                style="
                  margin: 0 0 4px 0; 
                  color: #003273; 
                  font-size: 14px; 
                  cursor: pointer;
                  text-decoration: underline;
                "
                onmouseover="this.style.color='#002a5a'"
                onmouseout="this.style.color='#003273'"
              >
                ${item.name}
              </h4>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 11px;">${item.address}</p>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 11px;">距離: ${item.distance || 0}m</p>
              <p style="margin: 0 0 8px 0; color: #003273; font-size: 12px; font-weight: bold;">¥${item.plan.price_total.toLocaleString()}</p>
              <button 
                onclick="window.open('/reserve/${item.space_id}', '_blank')"
                style="
                  background-color: #003273; 
                  color: #FFEB00; 
                  border: none; 
                  padding: 6px 12px; 
                  border-radius: 4px; 
                  font-size: 11px; 
                  font-weight: bold; 
                  cursor: pointer;
                  width: 100%;
                "
                onmouseover="this.style.backgroundColor='#002a5a'"
                onmouseout="this.style.backgroundColor='#003273'"
              >
                詳細を見る
              </button>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        window.resultMarkers.push(marker);
      } else {
        // フォールバック: 住所から座標を取得
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: item.address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const marker = new google.maps.Marker({
              position: results[0].geometry.location,
              map: map,
              title: item.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12.5" cy="12.5" r="10" fill="#003273" stroke="#FFEB00" stroke-width="1"/>
                    <text x="12.5" y="16" text-anchor="middle" font-size="8" fill="#FFEB00" font-weight="bold">物件</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(25, 25),
                anchor: new google.maps.Point(12.5, 12.5)
              }
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; font-family: Arial, sans-serif; max-width: 200px;">
                  <h4 
                    onclick="window.open('/reserve/${item.space_id}', '_blank')"
                    style="
                      margin: 0 0 4px 0; 
                      color: #003273; 
                      font-size: 14px; 
                      cursor: pointer;
                      text-decoration: underline;
                    "
                    onmouseover="this.style.color='#002a5a'"
                    onmouseout="this.style.color='#003273'"
                  >
                    ${item.name}
                  </h4>
                  <p style="margin: 0 0 4px 0; color: #666; font-size: 11px;">${item.address}</p>
                  <p style="margin: 0 0 8px 0; color: #003273; font-size: 12px; font-weight: bold;">¥${item.plan.price_total.toLocaleString()}</p>
                  <button 
                    onclick="window.open('/reserve/${item.space_id}', '_blank')"
                    style="
                      background-color: #003273; 
                      color: #FFEB00; 
                      border: none; 
                      padding: 6px 12px; 
                      border-radius: 4px; 
                      font-size: 11px; 
                      font-weight: bold; 
                      cursor: pointer;
                      width: 100%;
                    "
                    onmouseover="this.style.backgroundColor='#002a5a'"
                    onmouseout="this.style.backgroundColor='#003273'"
                  >
                    詳細を見る
                  </button>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            window.resultMarkers.push(marker);
          }
        });
      }
    });
  };

  return (
    <div className="w-full">
             {/* 検索コントロール */}
       <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
         <h3 className="text-lg font-semibold mb-3 text-gray-800">地図上で検索</h3>
         <div className="space-y-4">
           <p className="text-sm text-gray-600">
             地図上をクリックして検索エリアを設定してください
           </p>
           
           {/* 距離フィルター */}
           <div className="space-y-2">
             <label className="block text-sm font-medium text-gray-700">
               検索半径: {searchRadius / 1000}km
             </label>
             <div className="flex items-center space-x-4">
               <input
                 type="range"
                 min="500"
                 max="10000"
                 step="500"
                 value={searchRadius}
                 onChange={(e) => updateRadius(Number(e.target.value))}
                 className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
               />
               <div className="flex space-x-2">
                 <button
                   onClick={() => updateRadius(1000)}
                   className={`px-3 py-1 text-xs rounded ${
                     searchRadius === 1000
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                   }`}
                 >
                   1km
                 </button>
                 <button
                   onClick={() => updateRadius(2000)}
                   className={`px-3 py-1 text-xs rounded ${
                     searchRadius === 2000
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                   }`}
                 >
                   2km
                 </button>
                 <button
                   onClick={() => updateRadius(5000)}
                   className={`px-3 py-1 text-xs rounded ${
                     searchRadius === 5000
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                   }`}
                 >
                   5km
                 </button>
                 <button
                   onClick={() => updateRadius(10000)}
                   className={`px-3 py-1 text-xs rounded ${
                     searchRadius === 10000
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                   }`}
                 >
                   10km
                 </button>
               </div>
             </div>
           </div>

                       <div className="flex space-x-2">
              <button
                onClick={searchInArea}
                disabled={!searchArea || isSearching}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                {isSearching ? '検索中...' : 'このエリアで検索'}
              </button>
              {searchArea && (
                <button
                  onClick={clearSearchArea}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  title="検索エリアをクリア"
                >
                  クリア
                </button>
              )}
            </div>
         </div>
       </div>

      {/* 地図 */}
      {/* 修正 by M. Tanabe - レスポンシブ対応 */}
      <div className="w-full h-96 md:h-[500px] rounded-lg overflow-hidden border">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </div>
  );
}
// 修正 by M. Tanabe - 終了
