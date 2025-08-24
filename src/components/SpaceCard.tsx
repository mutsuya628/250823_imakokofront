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
};

export default function SpaceCard({ item }: { item: SpaceCardItem }) {
  return (
  <div className="rounded-xl p-4 bg-white/70 backdrop-blur flex flex-row items-center gap-4">
      <div className="flex-1">
        <div className="text-sm text-gray-500">{item.category === 'vacant_house' ? '空き家' : '空き店舗'}</div>
        <h3 className="text-lg font-semibold">{item.name}</h3>
        <div className="text-sm">{item.city}／{item.address}</div>
        <div className="mt-2 text-sm">Wi-Fi：{item.wifi_mbps} Mbps　個室：{item.private_room ? 'あり' : 'なし'}</div>
        {/* プラン名・期間のみ表示 */}
        {/* <div className="mt-3 text-sm">
          <span className="font-medium">{item.plan.plan_name}</span>
          （{item.plan.start_date} → {item.plan.end_date}）
        </div> */}
        <div className="mt-2 text-2xl font-bold">¥{item.plan.price_total.toLocaleString()}</div>
        <div className="mt-3">
          <Link
            className="inline-block rounded px-4 py-2 font-bold"
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
      className="w-40 h-40 object-cover rounded-lg"
      onError={handleError}
      priority
    />
  );
}
