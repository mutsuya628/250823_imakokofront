import Link from "next/link";

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
    <div className="rounded-xl border p-4 bg-white/70 backdrop-blur">
      <div className="text-sm text-gray-500">{item.category === 'vacant_house' ? '空き家' : '空き店舗'}</div>
      <h3 className="text-lg font-semibold">{item.name}</h3>
      <div className="text-sm">{item.city}／{item.address}</div>
      <div className="mt-2 text-sm">Wi-Fi：{item.wifi_mbps} Mbps　個室：{item.private_room ? 'あり' : 'なし'}</div>
      <div className="mt-3 text-sm">
        <span className="font-medium">{item.plan.plan_name}</span> × {item.plan.units} 単位
        （{item.plan.start_date} → {item.plan.end_date}）
      </div>
      <div className="mt-2 text-2xl font-bold">¥{item.plan.price_total.toLocaleString()}</div>
      <div className="mt-3">
        <Link className="inline-block bg-gray-900 text-white rounded px-4 py-2" href={`/reserve/${item.space_id}`}>
          予約に進む
        </Link>
      </div>
    </div>
  )
}
