"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const slots = [
  "Today · 2:00 p.m.",
  "Today · 2:40 p.m.",
  "Today · 4:20 p.m.",
  "Tomorrow · 9:00 a.m.",
  "Tomorrow · 11:20 a.m.",
  "Tomorrow · 3:00 p.m.",
];

export function BookingMatrix({
  bookings,
}: {
  bookings: { id: number; scheduledAt: string | null; topic: string; status: string }[];
}) {
  const router = useRouter();
  const [topic, setTopic] = useState("Medication review");
  const [status, setStatus] = useState("");

  async function book(slot: string) {
    setStatus("Reserving…");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: slot, topic }),
    });
    setStatus(res.ok ? `Held ${slot}` : "Could not book");
    router.refresh();
  }

  return (
    <div>
      <label htmlFor="topic">Consultation topic</label>
      <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
        <option>Medication review</option>
        <option>New prescription counseling</option>
        <option>Device teaching (inhaler / glucometer)</option>
        <option>Travel / cold-chain questions</option>
      </select>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {slots.map((slot) => {
          const taken = bookings.some((b) => b.scheduledAt === slot);
          return (
            <button
              key={slot}
              type="button"
              disabled={taken}
              onClick={() => void book(slot)}
              className={`rounded-2xl border px-3 py-4 text-left ${taken ? "border-ink/10 bg-cream text-ink-soft" : "border-ink/20 bg-white hover:border-teal"}`}
            >
              <span className="block font-semibold">{slot}</span>
              <span className="text-sm">{taken ? "Held" : "20 min · video"}</span>
            </button>
          );
        })}
      </div>
      {status ? <p className="mt-3 text-teal">{status}</p> : null}
      {bookings.some((b) => b.scheduledAt) ? (
        <ul className="mt-5 space-y-2 text-sm">
          {bookings
            .filter((b) => b.scheduledAt)
            .map((b) => (
              <li key={b.id}>
                {b.scheduledAt} · {b.topic} · {b.status}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
