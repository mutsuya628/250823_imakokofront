"use client";
import { useState } from "react";
import ShimanamiHero from "@/components/ShimanamiHero";
import SearchForm from "@/components/SearchForm";
import SpaceCard from "@/components/SpaceCard";

export default function Page() {
  const [results, setResults] = useState<any[]>([]);
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
