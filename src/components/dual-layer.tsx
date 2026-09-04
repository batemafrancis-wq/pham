"use client";

import { useState } from "react";

export function DualLayer({
  usage,
  dosage,
  warnings,
  activeIngredients,
  interactions,
  clinicalNotes,
  clinicalTrials,
}: {
  usage: string;
  dosage: string;
  warnings: string;
  activeIngredients: string;
  interactions: string;
  clinicalNotes: string;
  clinicalTrials: string;
}) {
  const [layer, setLayer] = useState<"consumer" | "pro">("consumer");

  return (
    <section className="mt-10 rounded-3xl border border-ink/10 bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Clinical detail</h2>
        <div className="flex rounded-full border border-ink/15 p-1">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${layer === "consumer" ? "bg-teal text-cream" : ""}`}
            onClick={() => setLayer("consumer")}
          >
            Layer 1 · Patient
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${layer === "pro" ? "bg-ink text-cream" : ""}`}
            onClick={() => setLayer("pro")}
          >
            Layer 2 · Monograph
          </button>
        </div>
      </div>
      {layer === "consumer" ? (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <article>
            <h3 className="text-sm uppercase tracking-[0.16em] text-ink-soft">How to use</h3>
            <p className="mt-2 text-[1.05rem]">{usage}</p>
          </article>
          <article>
            <h3 className="text-sm uppercase tracking-[0.16em] text-ink-soft">Simple dosage</h3>
            <p className="mt-2 text-[1.05rem]">{dosage}</p>
          </article>
          <article className="rounded-2xl bg-cream p-4">
            <h3 className="text-sm uppercase tracking-[0.16em] text-alert">Major warnings</h3>
            <p className="mt-2 text-[1.05rem]">{warnings}</p>
          </article>
        </div>
      ) : (
        <div className="mt-6 grid gap-6">
          <article>
            <h3 className="text-sm uppercase tracking-[0.16em] text-ink-soft">Active ingredients</h3>
            <p className="mt-2 text-[1.05rem]">{activeIngredients}</p>
          </article>
          <article>
            <h3 className="text-sm uppercase tracking-[0.16em] text-ink-soft">Deep interactions</h3>
            <p className="mt-2 text-[1.05rem]">{interactions}</p>
          </article>
          <article>
            <h3 className="text-sm uppercase tracking-[0.16em] text-ink-soft">Clinical notes</h3>
            <p className="mt-2 text-[1.05rem]">{clinicalNotes}</p>
          </article>
          <article className="rounded-2xl bg-ink p-5 text-cream">
            <h3 className="text-sm uppercase tracking-[0.16em] text-gold-soft">Trials & evidence</h3>
            <p className="mt-2 text-[1.05rem]">{clinicalTrials}</p>
          </article>
        </div>
      )}
    </section>
  );
}
