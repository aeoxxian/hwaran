"use client";

import { useEffect, useState } from "react";

type Mode = "mock" | "notion-live" | "loading";

interface StatusResponse {
  mode: Mode;
  notion: boolean;
  jwt: boolean;
  storage: { configured: boolean };
  email: { configured: boolean };
  summary: { configuredDatabases: number; totalDatabases: number };
}

export default function RuntimeModeBadge({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded || !status) return null;

  const isLive = status.mode === "notion-live";
  const tone = isLive
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  const label = isLive ? "NOTION LIVE" : "MOCK";

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5 ${tone}`}
        title={`Notion ${status.notion ? "OK" : "OFF"} · DB ${status.summary.configuredDatabases}/${status.summary.totalDatabases}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
        {label}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 text-xs font-medium ${tone}`}
      title="런타임 모드 상태"
    >
      <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-500"}`} />
      <span>{label}</span>
      <span className="text-[10px] opacity-70">
        DB {status.summary.configuredDatabases}/{status.summary.totalDatabases}
      </span>
    </div>
  );
}
