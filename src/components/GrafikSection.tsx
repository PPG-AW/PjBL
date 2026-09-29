"use client";

import { useState } from "react";
import GrafikInteraktif from "./GrafikInteraktif";
import { MarkComplete } from "./client-bits";

const PRESET = [
  { a: 100, b: 50, c: 4000, label: "Tepung", unit: "gram" },
  { a: 1, b: 1, c: 50, label: "Telur", unit: "butir" },
  { a: 15, b: 10, c: 600, label: "Waktu oven", unit: "menit" },
];

export default function GrafikSection({ done }: { done: boolean }) {
  const [interacted, setInteracted] = useState(false);

  return (
    <div className="space-y-6">
      <GrafikInteraktif
        constraints={PRESET}
        objective={{ a: 4000, b: 3000 }}
        productA="Roti"
        productB="Donat"
        onInteract={() => setInteracted(true)}
      />
      <div className="flex items-center gap-4">
        <MarkComplete
          feature="grafik"
          done={done}
          disabled={!interacted && !done}
          hint="Geser slider atau klik titik pojok dulu untuk membuka tombol ini."
        />
      </div>
    </div>
  );
}
