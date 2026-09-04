"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Rx = { id: number; name: string; remaining: number; next: string | null };
type Schedule = {
  id: number;
  prescriptionId: number;
  frequency: string;
  deliveryMethod: string;
  active: boolean;
};

export function RefillManager({
  prescriptions,
  schedules,
}: {
  prescriptions: Rx[];
  schedules: Schedule[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function save(prescriptionId: number, form: FormData) {
    setStatus("Saving…");
    await fetch("/api/refills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prescriptionId,
        frequency: form.get("frequency"),
        deliveryMethod: form.get("deliveryMethod"),
        active: form.get("active") === "on",
      }),
    });
    setStatus("Schedule updated");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-4">
      {prescriptions.map((rx) => {
        const existing = schedules.find((s) => s.prescriptionId === rx.id);
        return (
          <form
            key={rx.id}
            className="rounded-3xl border border-ink/10 bg-white p-6"
            action={(form) => void save(rx.id, form)}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">{rx.name}</h2>
                <p className="text-ink-soft">
                  {rx.remaining} refills left · next eligible {rx.next ?? "on pharmacist review"}
                </p>
              </div>
              <label className="flex items-center gap-2 font-normal">
                <input type="checkbox" name="active" defaultChecked={existing?.active ?? true} className="h-4 w-4" />
                Auto-refill on
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={`freq-${rx.id}`}>Delivery frequency</label>
                <select id={`freq-${rx.id}`} name="frequency" defaultValue={existing?.frequency ?? "every-30-days"}>
                  <option value="every-30-days">Every 30 days</option>
                  <option value="every-60-days">Every 60 days</option>
                  <option value="every-90-days">Every 90 days</option>
                </select>
              </div>
              <div>
                <label htmlFor={`del-${rx.id}`}>Fulfillment</label>
                <select id={`del-${rx.id}`} name="deliveryMethod" defaultValue={existing?.deliveryMethod ?? "courier"}>
                  <option value="courier">Temperature-aware courier</option>
                  <option value="pickup">Local pharmacy pickup</option>
                  <option value="coldchain">Cold-chain hub only</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary mt-5" type="submit">
              Save schedule
            </button>
          </form>
        );
      })}
      {status ? <p className="text-teal">{status}</p> : null}
    </div>
  );
}
