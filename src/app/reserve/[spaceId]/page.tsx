"use client";
import React from "react";
import { useEffect, useState } from "react";
import { getSpace, createReservation } from "@/lib/api";
import { useRouter } from "next/navigation";

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

export default function ReservePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = React.use(params);
  const router = useRouter();
  //const [data, setData] = useState<any>(null);
  const [data, setData] = useState<ReserveData | null>(null);
  const [planCode, setPlanCode] = useState(""); // ← 初期は空
  const [startDate, setStartDate] = useState(today()); // ← 今日を初期セット
  const [units, setUnits] = useState(1);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState<string | null>(null); // ← エラー表示用

  useEffect(() => {
    getSpace(spaceId).then((d) => {
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

      if (res?.reservation_id) {
        alert("予約が確定しました！");
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">{data.space.name}</h1>
      <div className="text-sm text-gray-600 mt-1">
        {data.space.city}／{data.space.address}
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-4 bg-white">
          <h2 className="font-semibold mb-2">プラン選択</h2>
          <form onSubmit={submit} className="grid gap-3">
            <label className="text-sm">プラン</label>
            <select
              className="border rounded px-3 py-2"
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

            <label className="text-sm">開始日</label>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <label className="text-sm">単位数</label>
            <input
              type="number"
              min={1}
              className="border rounded px-3 py-2"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
            />

            <label className="text-sm">お名前（任意）</label>
            <input
              className="border rounded px-3 py-2"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            <label className="text-sm">メール（任意）</label>
            <input
              type="email"
              className="border rounded px-3 py-2"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              className="mt-2 bg-gray-900 text-white rounded px-4 py-2"
            >
              予約を確定
            </button>
          </form>
        </div>

        <div className="rounded-xl border p-4 bg-white">
          <h2 className="font-semibold mb-2">設備・情報</h2>
          <ul className="text-sm space-y-1">
            <li>Wi-Fi：{data.space.wifi_mbps} Mbps</li>
            <li>個室：{data.space.private_room ? "あり" : "なし"}</li>
            <li>定員：{data.space.capacity_total} 名</li>
            <li>
              カテゴリ：
              {data.space.category === "vacant_house" ? "空き家" : "空き店舗"}
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
