"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChatLounge({
  consultationId,
  messages,
}: {
  consultationId: number | null;
  messages: { id: number; sender: string; body: string }[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consultationId, body: text }),
    });
    setText("");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="mt-6 rounded-3xl border border-ink/10 bg-white">
      <div className="max-h-[420px] space-y-3 overflow-auto p-5">
        {messages.length === 0 ? (
          <p className="text-ink-soft">Start a private thread. Ask about timing, side effects, or whether a refill can ship today.</p>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.sender === "patient" ? "ml-auto bg-teal text-cream" : "bg-cream"}`}
          >
            <p className="text-xs uppercase tracking-[0.14em] opacity-80">{m.sender === "patient" ? "You" : "Pharmacist"}</p>
            <p className="mt-1">{m.body}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-ink/10 p-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message a pharmacist…"
          aria-label="Message a pharmacist"
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
        />
        <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void send()}>
          Send
        </button>
      </div>
    </div>
  );
}
