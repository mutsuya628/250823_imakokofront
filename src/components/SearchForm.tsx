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
  // 今日の日付をYYYY-MM-DD形式で取得
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const defaultDate = `${yyyy}-${mm}-${dd}`;
  const [startDate, setStartDate] = useState<string>(defaultDate);
  const [category, setCategory] = useState<string>('');

  useEffect(() => { getPlanTypes().then(setPlanTypes); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) { alert('開始日を選択してください'); return; }
    const payload = {
      plan_code: planCode,
      start_date: startDate,
      category: category || undefined,
      units: 1,
    };
    const res = await searchSpaces(payload);
    onResults(res);
  };

  return (
  <section className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/title2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
        }}
    >
            <div className="flex flex-row items-start justify-between w-full px-8 pt-8">
              {/* 左側: 検索フォーム */}
              <div style={{ maxWidth: 400, zIndex: 2 }}>
                <form onSubmit={submit} className="flex flex-col gap-6">
                  {/* ①場所 */}
                  <div className="mb-2"> 
                    <label className="block text-lg font-bold mb-1" style={{
                      color: '#003273',
                      textShadow: '0 0 2px #fff, 0 0 4px #fff',
                    }}>場所</label>
                    <select
                      className="w-full border rounded px-3 py-1 text-lg bg-white"
                      value={category}
                      onChange={e=>setCategory(e.target.value)}
                      style={{ backgroundColor: '#fff', color: '#003273' }}
                    >
                      <option value="vacant_house">空き家</option>
                      <option value="shopfront">商店街の空き店舗</option>
                    </select>
                  </div>
                  {/* ②使う日 */}
                  <div className="mb-2 cursor-pointer" onClick={() => document.getElementById('date-input')?.focus()}>
                    <label htmlFor="date-input" className="block text-lg font-bold mb-1" style={{
                      color: '#003273',
                      textShadow: '0 0 2px #fff, 0 0 4px #fff',
                    }}>使う日</label>
                    <input
                      id="date-input"
                      type="date"
                      className="w-full border rounded px-3 py-1 text-lg bg-white"
                      value={startDate}
                      onChange={e=>setStartDate(e.target.value)}
                      style={{ backgroundColor: '#fff', color: '#003273' }}
                    />
                  </div>
                  {/* ③ボタン */}
                  <button
                    type="submit"
                    className="w-full rounded px-4 py-3 text-xl font-bold mb-6"
                    style={{
                      backgroundColor: '#003273',
                      color: '#FFEB00',
                      letterSpacing: '0.05em',
                      boxShadow: '0 2px 8px rgba(0,50,115,0.15)',
                    }}
                  >
                    理想のワークプレイスに行く
                  </button>
                </form>
              </div>
            </div>
          </section>
  )
}
