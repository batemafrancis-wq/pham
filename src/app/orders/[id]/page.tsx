import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, stores } from "@/db/schema";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  const order = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0];
  if (!order) notFound();
  const store = order.storeId
    ? (await db.select().from(stores).where(eq(stores.id, order.storeId)).limit(1))[0]
    : null;
  const timeline = JSON.parse(order.timeline) as { label: string; detail: string; done: boolean }[];

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Active tracking timeline</p>
      <h1 className="mt-2 font-display text-5xl">Order #{order.id}</h1>
      <p className="mt-2 text-lg">
        {order.fulfillment} · {money(order.subtotalCents)} · HSA {money(order.hsaCents)} · FSA {money(order.fsaCents)} ·
        personal {money(order.personalCents)}
      </p>
      {store ? (
        <p className="mt-2 text-ink-soft">
          Fulfilling from {store.name} · {store.address}
        </p>
      ) : null}
      <ol className="mt-10 space-y-4">
        {timeline.map((step, index) => (
          <li key={step.label} className="flex gap-4 rounded-3xl bg-white p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-full ${step.done ? "bg-teal text-cream" : "bg-cream"}`}>
              {index + 1}
            </span>
            <div>
              <h2 className="font-display text-2xl">{step.label}</h2>
              <p className="text-ink-soft">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="photo-frame relative mt-10 h-64">
        <Image
          src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80"
          alt="Sealed parcel being handed to a patient"
          fill
          className="object-cover"
        />
      </div>
      <Link href="/dashboard" className="btn btn-ghost mt-8">
        Return to sanctuary
      </Link>
    </main>
  );
}
