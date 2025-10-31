// frontend/app/api/alert/route.ts

export const revalidate = 60; // 1分キャッシュ

type JmaWarningItem = {
  code?: string;
  name?: string;
  status?: string;
};

type JmaArea = {
  code?: string;
  name?: string;
  warnings?: JmaWarningItem[];
};

type JmaResponse = {
  reportDatetime?: string;
  areaTypes?: Array<{ areas?: JmaArea[] }>;
};

function classify(code: string) {
  if (code.startsWith("3")) return "special"; // 特別警報
  if (code.startsWith("0")) return "warning"; // 警報
  if (code.startsWith("1") || code.startsWith("2")) return "advisory"; // 注意報
  return "other";
}

export async function GET() {
  try {
    const res = await fetch("https://www.jma.go.jp/bosai/warning/data/warning_170000.json");
    if (!res.ok) throw new Error("気象庁API取得失敗");

    const data = (await res.json()) as JmaResponse;
    const areas = [
      ...(data.areaTypes?.[0]?.areas ?? []),
      ...(data.areaTypes?.[1]?.areas ?? []),
    ];

    const buckets = { special: [] as string[], warning: [] as string[], advisory: [] as string[] };
    const seen = new Set<string>();

    for (const area of areas) {
      for (const w of area.warnings ?? []) {
        if (w.status === "解除") continue;
        const kind = w.code ? classify(w.code) : "other";
        const name = w.name ?? w.code ?? "不明";
        const entry = area.name ? `${name}（${area.name}）` : name;
        const key = `${kind}:${entry}`;
        if (seen.has(key)) continue;
        seen.add(key);
        (buckets as any)[kind]?.push(entry);
      }
    }

    const body = {
      updatedAt: data.reportDatetime ?? new Date().toISOString(),
      buckets,
      hasAny: buckets.special.length + buckets.warning.length + buckets.advisory.length > 0,
    };

    return new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
