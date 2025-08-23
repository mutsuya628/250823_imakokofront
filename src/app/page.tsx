"use client";
import { useState } from "react";
import ShimanamiHero from "@/components/ShimanamiHero";
import SearchForm from "@/components/SearchForm";
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
  // 必要に応じて他のフィールドも追加
};
export default function Page() {
  const [results, setResults] = useState<SpaceResult[]>([]);
  return (
    <main>
      <ShimanamiHero />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl p-5 bg-white shadow-sm -mt-16 relative z-10">
          <SearchForm onResults={setResults} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {results.map((item) => (
            <SpaceCard key={item.space_id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}

