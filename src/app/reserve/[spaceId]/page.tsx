"use client";
import React from "react";
import { useEffect, useState } from "react";
import { getSpace, createReservation } from "@/lib/api";
// 修正 by M. Tanabe - 地図・画像表示機能追加
import { useRouter } from "next/navigation";
import Map from "@/components/Map";
import Image from "next/image";

type Space = {
  name: string;
  city: string;
  address: string;
  wifi_mbps: number;
  private_room: boolean;
  capacity_total: number;
  category: string;
};

type Plan = {
  plan_code: string;
  plan_name: string;
  price_tax_included: number;
};

type ReserveData = {
  space: Space;
  plans: Plan[];
};

function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// 修正 by M. Tanabe - 物件画像表示コンポーネント追加
function SpaceImage({ spaceId, name }: { spaceId: string; name: string }) {
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
    <div className="mt-4">
      <Image
        src={src}
        alt={name + '画像'}
        width={400}
        height={300}
        className="w-full h-48 object-cover rounded-lg shadow-sm"
        onError={handleError}
        priority
      />
    </div>
  );
}

export default function ReservePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = React.use(params);
  const router = useRouter();
  const [data, setData] = useState<ReserveData | null>(null);
  const [planCode, setPlanCode] = useState(""); // ← 初期は空
  const [startDate, setStartDate] = useState(today()); // ← 今日を初期セット
  const [units, setUnits] = useState(1);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState<string | null>(null); // ← エラー表示用

  useEffect(() => {
    getSpace(spaceId).then((d: ReserveData) => {
      setData(d);
      // スペースが持っている最初のプランを初期選択
      const first = d?.plans?.[0]?.plan_code ?? "DAY";
      setPlanCode(first);
    });
  }, [spaceId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!planCode) {
      setError("プランを選択してください");
      return;
    }
    if (!startDate) {
      setError("開始日を入力してください");
      return;
    }

    try {
      const res = await createReservation({
        user_name: userName || "ゲスト",
        user_email: userEmail || "guest@example.com",
        space_id: spaceId,
        plan_code: planCode,
        start_date: startDate,
        units: Number(units),
      });

      // 修正 by M. Tanabe - 予約成功時のメッセージ改善
      if (res?.reservation_id) {
        alert("予約が確定しました！\nトップページに戻ります。");
        router.push("/");
      } else if (res?.error) {
        setError(`予約エラー: ${res.error}`);
      } else {
        setError("予約に失敗しました。入力内容をご確認ください。");
      }
    } catch (err) {
      setError("通信エラー: " + (err instanceof Error ? err.message : "unknown"));
    }
  };

  if (!data)
    return <div className="mx-auto max-w-6xl px-4 py-10">読み込み中…</div>;

  // 修正 by M. Tanabe - レスポンシブ対応・トップページ戻るボタン追加
  return (
    <main className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
      {/* 戻るボタン */}
      <div className="mb-4 md:mb-6">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          トップページに戻る
        </button>
      </div>

      {/* 修正 by M. Tanabe - レスポンシブフォント・レイアウト調整 */}
      <h1 className="text-xl md:text-2xl font-bold">{data.space.name}</h1>
      <div className="text-sm md:text-base text-gray-600 mt-1">
        {data.space.city}／{data.space.address}
      </div>

      <div className="mt-4 grid gap-4 md:gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-4 md:p-6 bg-white">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">プラン選択</h2>
          <form onSubmit={submit} className="grid gap-3 md:gap-4">
            <label className="text-sm md:text-base font-medium">プラン</label>
            <select
              className="border rounded px-3 py-2 md:py-3 text-sm md:text-base"
              value={planCode}
              onChange={(e) => setPlanCode(e.target.value)}
            >
              {data.plans.map((p: Plan) => (
                <option key={p.plan_code} value={p.plan_code}>
                  {p.plan_name}（{p.plan_code}） / ¥
                  {p.price_tax_included.toLocaleString()} × 単位
                </option>
              ))}
            </select>

            <label className="text-sm md:text-base font-medium">開始日</label>
            <input
              type="date"
              className="border rounded px-3 py-2 md:py-3 text-sm md:text-base"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <label className="text-sm md:text-base font-medium">単位数</label>
            <input
              type="number"
              min={1}
              className="border rounded px-3 py-2 md:py-3 text-sm md:text-base"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
            />

            <label className="text-sm md:text-base font-medium">お名前（任意）</label>
            <input
              className="border rounded px-3 py-2 md:py-3 text-sm md:text-base"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            <label className="text-sm md:text-base font-medium">メール（任意）</label>
            <input
              type="email"
              className="border rounded px-3 py-2 md:py-3 text-sm md:text-base"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />

            {error && <div className="text-red-600 text-sm md:text-base">{error}</div>}

            <button
              type="submit"
              className="mt-2 md:mt-4 bg-gray-900 text-white rounded px-4 py-2 md:py-3 text-sm md:text-base font-medium"
            >
              予約を確定
            </button>
          </form>
        </div>

        <div className="rounded-xl border p-4 md:p-6 bg-white">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">設備・情報</h2>
          <ul className="text-sm md:text-base space-y-2 md:space-y-3">
            <li>Wi-Fi：{data.space.wifi_mbps} Mbps</li>
            <li>個室：{data.space.private_room ? "あり" : "なし"}</li>
            <li>定員：{data.space.capacity_total} 名</li>
            <li>
              カテゴリ：
              {data.space.category === "vacant_house" ? "空き家" : "空き店舗"}
            </li>
          </ul>
          
          {/* 修正 by M. Tanabe - 物件画像表示追加 */}
          <SpaceImage spaceId={spaceId} name={data.space.name} />
        </div>
      </div>

      {/* 地図セクション */}
      {/* 修正 by M. Tanabe - 地図表示機能追加 */}
      <div className="mt-6 md:mt-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4">所在地</h2>
        <Map address={data.space.address} spaceName={data.space.name} />
      </div>
    </main>
  );
}
// 修正 by M. Tanabe - 終了
