"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddToCart({
  productId,
  hsaEligible,
  fsaEligible,
  rxRequired,
}: {
  productId: number;
  hsaEligible: boolean;
  fsaEligible: boolean;
  rxRequired: boolean;
}) {
  const router = useRouter();
  const [bucket, setBucket] = useState(hsaEligible ? "hsa" : fsaEligible ? "fsa" : "personal");
  const [status, setStatus] = useState("");

  async function add() {
    setStatus("Adding…");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1, billingBucket: bucket }),
    });
    if (res.ok) {
      setStatus("In your secure cart");
      router.refresh();
    } else {
      const data = (await res.json()) as { error?: string };
      setStatus(data.error ?? "Could not add");
    }
  }

  return (
    <div className="space-y-3">
      <fieldset className="grid gap-2">
        <legend className="mb-1 font-semibold">Billing bucket</legend>
        {hsaEligible ? (
          <label className="flex items-center gap-2 font-normal">
            <input
              type="radio"
              name={`bucket-${productId}`}
              checked={bucket === "hsa"}
              onChange={() => setBucket("hsa")}
              className="h-4 w-4"
            />
            Route to HSA card
          </label>
        ) : null}
        {fsaEligible ? (
          <label className="flex items-center gap-2 font-normal">
            <input
              type="radio"
              name={`bucket-${productId}`}
              checked={bucket === "fsa"}
              onChange={() => setBucket("fsa")}
              className="h-4 w-4"
            />
            Route to FSA card
          </label>
        ) : null}
        <label className="flex items-center gap-2 font-normal">
          <input
            type="radio"
            name={`bucket-${productId}`}
            checked={bucket === "personal"}
            onChange={() => setBucket("personal")}
            className="h-4 w-4"
          />
          Personal card
        </label>
      </fieldset>
      {rxRequired ? (
        <p className="text-sm text-ink-soft">
          This item requires a verified prescription. You can still reserve it; a pharmacist will match it to your file.
        </p>
      ) : null}
      <button type="button" className="btn btn-primary w-full" onClick={() => void add()}>
        Add to secure cart
      </button>
      {status ? <p className="text-sm text-teal">{status}</p> : null}
    </div>
  );
}
