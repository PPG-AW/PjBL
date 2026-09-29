/* ------------------------------------------------------------------ */
/*  SPtLDV engine: quiz bank, inequality parser & checker, formatting  */
/* ------------------------------------------------------------------ */

export const PASSING_SCORE = 70;
export const TOTAL_DAYS = 7;

export type QuizQuestion = {
  q: string;
  context?: string;
  options: string[];
  correct: number;
};

export const QUIZ: QuizQuestion[] = [
  {
    q: "Manakah di bawah ini yang merupakan pertidaksamaan linear dua variabel?",
    options: [
      "x² + y ≥ 8",
      "2x + 3y ≤ 12",
      "4x − 8 = 0",
      "xy ≤ 24",
    ],
    correct: 1,
  },
  {
    q: "Garis batas dari pertidaksamaan 5x + 2y ≤ 20 adalah …",
    options: ["5x + 2y > 20", "5x − 2y = 20", "5x + 2y = 20", "5x + 2y ≥ 0"],
    correct: 2,
  },
  {
    q: "Titik uji yang paling praktis untuk menentukan daerah penyelesaian suatu pertidaksamaan adalah …",
    options: ["(100, 100)", "(0, 0)", "(−5, −5)", "Titik tepat pada garis"],
    correct: 1,
  },
  {
    q: "Titik potong garis 2x + y = 20 dengan sumbu X adalah …",
    context: "Substitusikan y = 0.",
    options: ["(0, 20)", "(20, 0)", "(10, 0)", "(0, 10)"],
    correct: 2,
  },
  {
    q: "Titik potong garis 2x + y = 20 dengan sumbu Y adalah …",
    context: "Substitusikan x = 0.",
    options: ["(10, 0)", "(0, 20)", "(20, 0)", "(0, 10)"],
    correct: 1,
  },
  {
    q: "Satu roti butuh 100 gram tepung, satu donat butuh 50 gram. Stok tepung kantin 4.000 gram per hari. Jika x = banyak roti dan y = banyak donat, model matematikanya adalah …",
    options: [
      "100x + 50y ≥ 4.000",
      "50x + 100y ≤ 4.000",
      "100x + 50y = 4.000",
      "100x + 50y ≤ 4.000",
    ],
    correct: 3,
  },
  {
    q: "Frasa “stok bahan terbatas” atau “maksimal yang tersedia” dalam soal cerita produksi biasanya dimodelkan dengan tanda …",
    options: ["≥ (lebih dari atau sama dengan)", "= (sama dengan)", "> (lebih dari)", "≤ (kurang dari atau sama dengan)"],
    correct: 3,
  },
  {
    q: "Mengapa model produksi selalu memuat syarat x ≥ 0 dan y ≥ 0?",
    options: [
      "Supaya grafik terlihat lebih besar",
      "Karena harga bahan selalu naik",
      "Karena jumlah produk yang diproduksi tidak mungkin bernilai negatif",
      "Karena stok bahan tidak pernah habis",
    ],
    correct: 2,
  },
  {
    q: "Manakah titik yang memenuhi pertidaksamaan x + 2y ≤ 8?",
    options: ["(4, 3)", "(5, 2)", "(3, 3)", "(2, 3)"],
    correct: 3,
  },
  {
    q: "Fungsi keuntungan Z = 3.000x + 5.000y dengan titik pojok (0,0), (30,0), (20,20), dan (0,40). Keuntungan maksimum dicapai pada titik …",
    options: [
      "(30, 0) → Rp90.000",
      "(0, 40) → Rp200.000",
      "(20, 20) → Rp160.000",
      "(0, 0) → Rp0",
    ],
    correct: 1,
  },
];

/* --------------------------- Inequality parsing --------------------------- */

export type LinearPart = {
  a: number; // koefisien x
  b: number; // koefisien y
  c: number; // ruas kanan
  sign: "<=" | ">=" | "=";
};

/**
 * Parse strings like "250x + 100y <= 12000", "250x+100y≤12.000",
 * "x + y <= 60" into a LinearPart. Returns null when unparseable.
 */
export function parseLinear(raw: string): LinearPart | null {
  if (!raw) return null;
  let s = raw
    .toLowerCase()
    .replace(/−/g, "-")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/\s+/g, "");
  // Indonesian thousand separators "12.000" -> "12000", decimal comma -> dot
  s = s.replace(/(\d)\.(\d{3}\b)/g, "$1$2");
  s = s.replace(/(\d)\.(\d{3}\b)/g, "$1$2");
  s = s.replace(/,/g, ".");

  const m = s.match(
    /^(\d*\.?\d*)x([+-]\d*\.?\d*)?y(<=|>=|<|>|≤|≥|=)(\d+\.?\d*)$/
  );
  if (!m) return null;
  const num = (v: string | undefined, def: number) => {
    if (v === undefined || v === "" || v === "+") return def;
    if (v === "-") return -def;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : def;
  };
  const a = num(m[1], 1);
  const b = num(m[2], 1);
  const c = parseFloat(m[4]);
  if (!Number.isFinite(c)) return null;
  let sign: LinearPart["sign"];
  if (m[3] === "<=" || m[3] === "<") sign = "<=";
  else if (m[3] === ">=" || m[3] === ">") sign = ">=";
  else if (m[3] === "=") sign = "=";
  else return null;
  return { a, b, c, sign };
}

export function parseNonNeg(raw: string, variable: "x" | "y"): boolean | null {
  if (!raw || !raw.trim()) return null;
  let s = raw
    .toLowerCase()
    .replace(/−/g, "-")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/\s+/g, "");
  const re = new RegExp(`^${variable}(>=|>)0$`);
  return re.test(s);
}

export type RowFeedback = {
  row: number;
  label: string;
  ok: boolean;
  empty: boolean;
  hint: string | null;
};

/**
 * Compare one parsed answer against the key derived from interview data,
 * returning a targeted hint (never the answer).
 */
export function checkLinearRow(
  raw: string,
  key: { a: number; b: number; c: number },
  ctx: { ingredient: string; productA: string; productB: string; unit: string }
): RowFeedback {
  const label = ctx.ingredient;
  if (!raw.trim()) {
    return {
      row: 0,
      label,
      ok: false,
      empty: true,
      hint: `Baris ${ctx.ingredient} masih kosong. Tulis modelnya dalam bentuk ax + by ≤ c.`,
    };
  }
  const parsed = parseLinear(raw);
  if (!parsed) {
    return {
      row: 0,
      label,
      ok: false,
      empty: false,
      hint: `Format belum dikenali. Gunakan bentuk: (kebutuhan per ${ctx.productA})x + (kebutuhan per ${ctx.productB})y ≤ (total stok). Contoh penulisan: 250x+100y<=12000`,
    };
  }
  if (parsed.a !== key.a) {
    return {
      row: 0,
      label,
      ok: false,
      empty: false,
      hint: `Koefisien x kurang tepat. Cek lagi data wawancaramu: berapa ${ctx.unit} ${ctx.ingredient.toLowerCase()} untuk membuat satu ${ctx.productA}?`,
    };
  }
  if (parsed.b !== key.b) {
    return {
      row: 0,
      label,
      ok: false,
      empty: false,
      hint: `Koefisien y kurang tepat. Cek lagi data wawancaramu: berapa ${ctx.unit} ${ctx.ingredient.toLowerCase()} untuk membuat satu ${ctx.productB}?`,
    };
  }
  if (parsed.sign !== "<=") {
    return {
      row: 0,
      label,
      ok: false,
      empty: false,
      hint: `Tanda pertidaksamaannya belum pas. Stok ${ctx.ingredient.toLowerCase()} itu membatasi — pemakaian tidak boleh MELEBIHI stok. Tanda mana yang berarti “tidak melebihi”?`,
    };
  }
  if (parsed.c !== key.c) {
    return {
      row: 0,
      label,
      ok: false,
      empty: false,
      hint: `Ruas kanan belum tepat. Cek kolom “Total/Hari” pada data wawancara untuk ${ctx.ingredient.toLowerCase()}.`,
    };
  }
  return { row: 0, label, ok: true, empty: false, hint: null };
}

/* ------------------------------- Formatting ------------------------------ */

export function formatIDR(n: number): string {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

export function formatNum(n: number): string {
  return n.toLocaleString("id-ID");
}
