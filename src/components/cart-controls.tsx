"use client";

import { useRouter } from "next/navigation";

export function CartControls({
  id,
  quantity,
  bucket,
}: {
  id: number;
  quantity: number;
  bucket: string;
}) {
  const router = useRouter();

  async function patch(next: Record<string, unknown>) {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...next }),
    });
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button className="btn btn-ghost min-h-10 px-3" type="button" onClick={() => void patch({ quantity: quantity - 1 })}>
        −
      </button>
      <span>{quantity}</span>
      <button className="btn btn-ghost min-h-10 px-3" type="button" onClick={() => void patch({ quantity: quantity + 1 })}>
        +
      </button>
      <select
        value={bucket}
        onChange={(e) => void patch({ billingBucket: e.target.value })}
        className="min-h-10 w-auto"
        aria-label="Billing bucket"
      >
        <option value="hsa">HSA</option>
        <option value="fsa">FSA</option>
        <option value="personal">Personal</option>
      </select>
      <button className="text-alert" type="button" onClick={() => void patch({ quantity: 0 })}>
        Remove
      </button>
    </div>
  );
}
