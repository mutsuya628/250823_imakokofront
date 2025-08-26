import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

type SpaceCardPlan = {
  plan_code: string;
  plan_name: string;
  units: number;
  start_date: string;
  end_date: string;
  price_total: number;
};

type SpaceCardItem = {
  space_id: string;
  name: string;
  city: string;
  address: string;
  wifi_mbps: number;
  private_room: boolean;
  category: string;
  plan: SpaceCardPlan;
  // 修正 by M. Tanabe - 距離情報表示機能追加
  distance?: number; // 距離情報（オプション）
};

export default function SpaceCard({ item }: { item: SpaceCardItem }) {
  return (
    <div className="rounded-xl p-4 bg-white/70 backdrop-blur flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex-1 w-full">
        <div className="text-sm text-gray-500">{item.category === 'vacant_house' ? '空き家' : '空き店舗'}</div>
        <h3 className="text-lg md:text-xl font-semibold">{item.name}</h3>
        <div className="text-sm md:text-base">{item.city}／{item.address}</div>
        {item.distance && (
          <div className="text-sm text-blue-600 font-medium">
            距離: {item.distance}m
          </div>
        )}
        <div className="mt-2 text-sm md:text-base">Wi-Fi：{item.wifi_mbps} Mbps　個室：{item.private_room ? 'あり' : 'なし'}</div>
        {/* プラン名・期間のみ表示 */}
        {/* <div className="mt-3 text-sm">
          <span className="font-medium">{item.plan.plan_name}</span>
          （{item.plan.start_date} → {item.plan.end_date}）
        </div> */}
        <div className="mt-2 text-xl md:text-2xl font-bold">¥{item.plan.price_total.toLocaleString()}</div>
        <div className="mt-3">
          <Link
            className="inline-block rounded px-4 py-2 md:py-3 text-sm md:text-base font-bold"
            href={`/reserve/${item.space_id}`}
            style={{
              backgroundColor: '#003273', // PANTONE 288C
              color: '#FFEB00', // 黄色
              letterSpacing: '0.05em',
              boxShadow: '0 2px 8px rgba(0,50,115,0.15)',
            }}
          >
            ここでワーク
          </Link>
        </div>
      </div>
      <ImageForSpace spaceId={item.space_id} name={item.name} />
    </div>
  );
}

// 画像拡張子を判定して表示するコンポーネント
function ImageForSpace({ spaceId, name }: { spaceId: string; name: string }) {
  const candidates = [
    `/${spaceId}.png`,
    `/${spaceId}.jpeg`,
    `/${spaceId}.jpg`,
    `/${spaceId}.PNG`,
    `/${spaceId}.JPEG`,
    `/${spaceId}.JPG`,
  ];
  const [src, setSrc] = useState(candidates[0]);
  const [tried, setTried] = useState(0);

  const handleError = () => {
    if (tried < candidates.length - 1) {
      setTried(tried + 1);
      setSrc(candidates[tried + 1]);
    } else {
      setSrc('/file.svg');
    }
  };

  return (
    <Image
      src={src}
      alt={name + '画像'}
      width={160}
      height={160}
      // 修正 by M. Tanabe - レスポンシブ画像サイズ調整
      className="w-full h-48 md:w-40 md:h-40 object-cover rounded-lg"
      onError={handleError}
      priority
    />
  );
}
