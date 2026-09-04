"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { money } from "@/lib/money";
import { IconAlert, IconSnowflake, IconTruck } from "@/components/icons";

type Line = {
  id: number;
  quantity: number;
  billingBucket: string;
  productId: number;
  name: string;
  priceCents: number;
  hsaEligible: boolean;
  fsaEligible: boolean;
  requiresColdChain: boolean;
  image: string;
};

type Store = {
  id: number;
  name: string;
  address: string;
  waitMinutes: number;
  hasColdChain: boolean;
};

type Hit = {
  severity: string;
  description: string;
  recommendation: string;
  left: string;
  right: string;
};

export function CheckoutPipeline({
  lines,
  interactions,
  stores,
  expectedDob,
  patientName,
  hsaBalance,
  fsaBalance,
}: {
  lines: Line[];
  interactions: Hit[];
  stores: Store[];
  expectedDob: string;
  patientName: string;
  hsaBalance: number;
  fsaBalance: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState("");
  const [otp, setOtp] = useState("");
  const [fulfillment, setFulfillment] = useState(lines.some((l) => l.requiresColdChain) ? "coldchain" : "courier");
  const [storeId, setStoreId] = useState(stores[0]?.id ?? 1);
  const [consult, setConsult] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const totals = useMemo(() => {
    const hsa = lines
      .filter((l) => l.billingBucket === "hsa")
      .reduce((s, l) => s + l.priceCents * l.quantity, 0);
    const fsa = lines
      .filter((l) => l.billingBucket === "fsa")
      .reduce((s, l) => s + l.priceCents * l.quantity, 0);
    const personal = lines
      .filter((l) => l.billingBucket === "personal")
      .reduce((s, l) => s + l.priceCents * l.quantity, 0);
    return { hsa, fsa, personal, all: hsa + fsa + personal };
  }, [lines]);

  const needsConsult = interactions.some((i) => i.severity !== "mild");

  async function place() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dob,
        otp,
        fulfillment,
        storeId,
        consultAcknowledged: consult,
      }),
    });
    const data = (await res.json()) as { id?: number; error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not settle");
      return;
    }
    router.push(`/orders/${data.id}`);
  }

  if (lines.length === 0) {
    return <p className="mt-8">Your cart is empty.</p>;
  }

  return (
    <div className="mt-8">
      <ol className="grid gap-2 md:grid-cols-3">
        {["Patient verification", "Delivery configuration", "Sandbox settlement hub"].map((label, i) => (
          <li
            key={label}
            className={`rounded-2xl px-4 py-3 ${step === i + 1 ? "bg-teal text-cream" : "bg-white"}`}
          >
            <span className="text-sm">Step {i + 1}</span>
            <p className="font-semibold">{label}</p>
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <section className="mt-8 rounded-3xl bg-white p-6">
          <h2 className="font-display text-3xl">Confirm you are {patientName}</h2>
          <p className="mt-2 text-ink-soft">
            Before pricing locks, we match date of birth and a sandbox mobile OTP (use 4821).
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="dob">Date of birth</label>
              <input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div>
              <label htmlFor="otp">Secure mobile OTP</label>
              <input id="otp" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="4821" />
            </div>
          </div>
          <button
            className="btn btn-primary mt-6"
            type="button"
            onClick={() => {
              if (dob !== expectedDob || otp !== "4821") {
                setError("Identity did not match. Check DOB and OTP 4821.");
                return;
              }
              setError("");
              setStep(2);
            }}
          >
            Verify identity
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="mt-8 space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                key: "courier",
                title: "Temperature-aware courier",
                copy: "Sealed handoff, 2–6 hours in the metro. Highlighted if any line is refrigerated.",
                icon: <IconTruck />,
              },
              {
                key: "pickup",
                title: "Local pharmacy pickup",
                copy: "Ready at the counter after pharmacist review. No cold-chain guarantee at Back Bay.",
                icon: <IconTruck />,
              },
              {
                key: "coldchain",
                title: "Cold-chain hub",
                copy: "Required when a line is labeled refrigerated. Packed at Harbor Hub.",
                icon: <IconSnowflake />,
              },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFulfillment(opt.key)}
                className={`rounded-3xl border p-5 text-left ${fulfillment === opt.key ? "border-teal bg-cream" : "border-ink/10 bg-white"}`}
              >
                {opt.icon}
                <h3 className="mt-3 font-display text-2xl">{opt.title}</h3>
                <p className="mt-2 text-ink-soft">{opt.copy}</p>
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="store">Pickup / hub location</label>
            <select id="store" value={storeId} onChange={(e) => setStoreId(Number(e.target.value))}>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} · {store.waitMinutes} min wait {store.hasColdChain ? "· cold-chain" : ""}
                </option>
              ))}
            </select>
          </div>
          {lines.some((l) => l.requiresColdChain) ? (
            <p className="rounded-2xl bg-cream p-4">
              At least one item is flagged for refrigerated packing. Courier and cold-chain hub keep product integrity; some neighborhood counters cannot.
            </p>
          ) : null}
          <button className="btn btn-primary" type="button" onClick={() => setStep(3)}>
            Continue to settlement
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="mt-8 rounded-3xl bg-white p-6">
          <h2 className="font-display text-3xl">HSA / FSA split-billing matrix</h2>
          <p className="mt-2 text-ink-soft">
            Prescription and eligible OTC ride the medical cards. Supplements stay on the personal card — one authorization.
          </p>
          <div className="mt-5 space-y-3">
            {lines.map((line) => (
              <div key={line.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                  <Image src={line.image} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{line.name}</p>
                  <p className="text-sm text-ink-soft">
                    {line.quantity} × {money(line.priceCents)} · {line.billingBucket.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <dl className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-cream p-4">
              <dt>HSA card</dt>
              <dd className="font-display text-3xl">{money(totals.hsa)}</dd>
              <p className="text-sm">Available {money(hsaBalance)}</p>
            </div>
            <div className="rounded-2xl bg-cream p-4">
              <dt>FSA card</dt>
              <dd className="font-display text-3xl">{money(totals.fsa)}</dd>
              <p className="text-sm">Available {money(fsaBalance)}</p>
            </div>
            <div className="rounded-2xl bg-ink p-4 text-cream">
              <dt>Personal card</dt>
              <dd className="font-display text-3xl">{money(totals.personal)}</dd>
            </div>
          </dl>
          {interactions.length > 0 ? (
            <div className="mt-6 rounded-2xl border-2 border-warn p-4">
              <p className="flex items-center gap-2 font-semibold text-warn">
                <IconAlert /> Interaction notice
              </p>
              {interactions.map((hit) => (
                <p key={hit.left} className="mt-2">
                  {hit.left} + {hit.right}: {hit.description}
                </p>
              ))}
              <label className="mt-3 flex items-start gap-2 font-normal">
                <input type="checkbox" checked={consult} onChange={(e) => setConsult(e.target.checked)} className="mt-1 h-4 w-4" />
                I request the free, mandatory pharmacist consult before this order is packed.
              </label>
            </div>
          ) : null}
          <button
            className="btn btn-gold mt-6 w-full"
            type="button"
            disabled={busy || (needsConsult && !consult)}
            onClick={() => void place()}
          >
            {busy ? "Authorizing…" : `Authorize ${money(totals.all)}`}
          </button>
        </section>
      ) : null}

      {error ? <p className="mt-4 text-alert">{error}</p> : null}
    </div>
  );
}
