"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Rx = {
  id: number;
  fileName: string;
  imagePath: string | null;
  ocrText: string | null;
  status: string;
  medicationName: string | null;
  dosage: string | null;
  prescriber: string | null;
  ndc: string | null;
};

export function PharmacistDesk({ queue }: { queue: Rx[] }) {
  const router = useRouter();
  const [active, setActive] = useState(queue[0] ?? null);

  async function setStatus(status: string) {
    if (!active) return;
    await fetch("/api/pharmacist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: active.id, status }),
    });
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <ul className="space-y-2">
        {queue.map((rx) => (
          <li key={rx.id}>
            <button
              type="button"
              onClick={() => setActive(rx)}
              className={`w-full rounded-2xl border px-4 py-3 text-left ${active?.id === rx.id ? "border-teal bg-cream" : "border-ink/10 bg-white"}`}
            >
              <span className="block font-semibold">{rx.medicationName ?? rx.fileName}</span>
              <span className="text-sm capitalize text-ink-soft">{rx.status}</span>
            </button>
          </li>
        ))}
      </ul>
      {active ? (
        <article className="rounded-3xl bg-white p-5">
          <h2 className="font-display text-3xl">{active.medicationName}</h2>
          <p>{active.prescriber}</p>
          <p className="text-sm">{active.dosage}</p>
          <p className="text-sm">NDC {active.ndc}</p>
          <pre className="mt-4 overflow-auto rounded-2xl bg-cream p-4 text-sm">{active.ocrText}</pre>
          {active.imagePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={active.imagePath} alt="Slip" className="mt-4 max-h-52 rounded-2xl object-cover" />
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="btn btn-primary" type="button" onClick={() => void setStatus("verified")}>
              Approve fill
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => void setStatus("review")}>
              Hold for review
            </button>
            <button className="btn btn-ghost text-alert" type="button" onClick={() => void setStatus("rejected")}>
              Reject
            </button>
          </div>
        </article>
      ) : (
        <p>Queue empty.</p>
      )}
    </div>
  );
}
