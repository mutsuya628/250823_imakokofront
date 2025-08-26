"use client";
import { useState } from "react";
import ShimanamiHero from "@/components/ShimanamiHero";
import SearchForm from "@/components/SearchForm";
import MapSearch from "@/components/MapSearch";
import SpaceCard from "@/components/SpaceCard";

type SpaceResult = {
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
    units: number;
    start_date: string;
    end_date: string;
    price_total: number;
  };
};

export default function Page() {
  const [results, setResults] = useState<SpaceResult[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'map'>('form');

  return (
    <main>
      <ShimanamiHero />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl p-5 bg-white shadow-sm -mt-16 relative z-10">
          {/* タブ切り替え */}
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'form'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              フォーム検索
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'map'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              地図検索
            </button>
          </div>

          {/* 検索コンテンツ */}
          {activeTab === 'form' ? (
            <SearchForm onResults={setResults} />
          ) : (
            <MapSearch onResults={setResults} />
          )}
        </div>
        
        {/* 検索結果 */}
        {results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">検索結果 ({results.length}件)</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {results.map((item, index) => (
                <SpaceCard key={`${item.space_id}-${item.plan?.plan_code || 'default'}-${index}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

