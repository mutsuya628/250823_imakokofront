'use client';
import { useEffect, useState } from 'react';
import { getPlanTypes, searchSpaces } from '@/lib/api';

type Result = {
  space_id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  wifi_mbps: number;
  private_room: boolean;
  capacity_total: number; // ← 追加
  plan: {
    plan_code: string;
    plan_name: string;
    unit_days: number;
    units: number;
    price_total: number;
    start_date: string;
    end_date: string;
  };
};

type PlanType = {
  plan_type_id: number;
  code: string;
  name_ja: string;
  unit_days: number;
};

export default function SearchForm({ onResults }: { onResults: (r: Result[]) => void }) {
  const [planTypes, setPlanTypes] = useState<PlanType[]>([]);
  const [planCode, setPlanCode] = useState('DAY');
  const [startDate, setStartDate] = useState<string>('');
  const [units, setUnits] = useState<number>(1);
  const [maxPrice, setMaxPrice] = useState<number|''>('');
  const [minWifi, setMinWifi] = useState<string>('');
  const [privateRoom, setPrivateRoom] = useState(false);
  const [category, setCategory] = useState<string>('');

  useEffect(() => { getPlanTypes().then(setPlanTypes); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) { alert('開始日を選択してください'); return; }
    const payload = {
      plan_code: planCode,
      start_date: startDate,
      units: Number(units),
      max_price_total: maxPrice === '' ? undefined : Number(maxPrice),
      min_wifi_mbps: minWifi === '' ? undefined : Number(minWifi),
      private_room_required: privateRoom || undefined,
      category: category || undefined,
    };
    const res = await searchSpaces(payload);
    onResults(res);
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3">
      <div className="md:col-span-2">
        <label className="block text-sm mb-1">プラン</label>
        <select className="w-full border rounded px-3 py-2" value={planCode} onChange={e=>setPlanCode(e.target.value)}>
          {planTypes.map((p: PlanType) => (
            <option key={p.plan_type_id} value={p.code}>{p.name_ja}（{p.code}）</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">開始日</label>
        <input type="date" className="w-full border rounded px-3 py-2" value={startDate} onChange={e=>setStartDate(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm mb-1">単位数</label>
        <input type="number" min={1} className="w-full border rounded px-3 py-2" value={units} onChange={e=>setUnits(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm mb-1">最大合計料金（円）</label>
        <input type="number" min={0} className="w-full border rounded px-3 py-2" value={maxPrice} onChange={e=>setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm mb-1">Wi-Fi速度（Mbps以上）</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={minWifi}
          onChange={e => setMinWifi(e.target.value)}
          min={0}
        />
      </div>
      <div className="md:col-span-6 flex items-center gap-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={privateRoom} onChange={e=>setPrivateRoom(e.target.checked)} />個室必須</label>
        <select className="border rounded px-3 py-2" value={category} onChange={e=>setCategory(e.target.value)}>
          <option value="">カテゴリー指定なし</option>
          <option value="vacant_house">空き家</option>
          <option value="shopfront">商店街の空き店舗</option>
        </select>
        <button type="submit" className="ml-auto bg-sky-600 hover:bg-sky-700 text-white rounded px-4 py-2">検索</button>
      </div>
    </form>
  );
}
