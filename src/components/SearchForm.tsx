'use client';
import { useEffect, useState } from 'react';
import { getPlanTypes, searchSpaces } from '../lib/api';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [planTypes, setPlanTypes] = useState<PlanType[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [planCode, setPlanCode] = useState('DAY');
  // 今日の日付をYYYY-MM-DD形式で取得
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const defaultDate = `${yyyy}-${mm}-${dd}`;
  const [startDate, setStartDate] = useState<string>(defaultDate);
  const [category, setCategory] = useState<string>('');

  // 修正 by M. Tanabe - エラーハンドリング追加
  useEffect(() => { 
    getPlanTypes()
      .then(setPlanTypes)
      .catch(error => {
        console.error('プランタイプ取得エラー:', error);
      });
  }, []);
  // 修正 by M. Tanabe - 終了

  // 修正 by M. Tanabe - エラーハンドリング追加
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) { alert('開始日を選択してください'); return; }
    try {
      const payload = {
        plan_code: planCode,
        start_date: startDate,
        category: category || undefined,
        units: 1,
      };
      const res = await searchSpaces(payload);
      onResults(res);
    } catch (error) {
      console.error('検索エラー:', error);
      alert('検索中にエラーが発生しました。APIサーバーが起動しているか確認してください。');
    }
  };
  // 修正 by M. Tanabe - 終了

  return (
  // 修正 by M. Tanabe - レスポンシブデザイン対応
  <section className="relative overflow-hidden min-h-[300px] md:min-h-[400px]"
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
            {/* 修正 by M. Tanabe - レスポンシブレイアウト調整 */}
            <div className="flex flex-col md:flex-row items-start justify-between w-full px-4 md:px-8 pt-4 md:pt-8">
              {/* 検索フォーム */}
              <div className="w-full md:max-w-md lg:max-w-lg z-10">
                <form onSubmit={submit} className="flex flex-col gap-4 md:gap-6">
                  {/* ①場所 */}
                  <div className="mb-2"> 
                    {/* 修正 by M. Tanabe - レスポンシブフォントサイズ調整 */}
                    <label className="block text-base md:text-lg font-bold mb-1" style={{
                      color: '#003273',
                      textShadow: '0 0 2px #fff, 0 0 4px #fff',
                    }}>場所</label>
                    <select
                      // 修正 by M. Tanabe - レスポンシブパディング・フォント調整
                      className="w-full border rounded px-3 py-2 md:py-3 text-base md:text-lg bg-white"
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
                    {/* 修正 by M. Tanabe - レスポンシブフォントサイズ調整 */}
                    <label htmlFor="date-input" className="block text-base md:text-lg font-bold mb-1" style={{
                      color: '#003273',
                      textShadow: '0 0 2px #fff, 0 0 4px #fff',
                    }}>使う日</label>
                    <input
                      id="date-input"
                      type="date"
                      // 修正 by M. Tanabe - レスポンシブパディング・フォント調整
                      className="w-full border rounded px-3 py-2 md:py-3 text-base md:text-lg bg-white"
                      value={startDate}
                      onChange={e=>setStartDate(e.target.value)}
                      style={{ backgroundColor: '#fff', color: '#003273' }}
                    />
                  </div>
                  {/* ③ボタン */}
                  <button
                    type="submit"
                    // 修正 by M. Tanabe - レスポンシブパディング・フォント・マージン調整
                    className="w-full rounded px-4 py-3 md:py-4 text-lg md:text-xl font-bold mb-4 md:mb-6"
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
