import Image from "next/image";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { IconClock, IconPin, IconSnowflake } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const rows = await db.select().from(stores);

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Location / store finder</p>
      <h1 className="mt-2 font-display text-5xl">Four Boston-area clinical counters</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-soft">
        Live wait estimates, cold-chain capability, and pharmacist hours. Pickup is reserved during checkout.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {rows.map((store) => (
          <article key={store.id} className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
            <div className="relative h-56">
              <Image src={store.image} alt={store.name} fill className="object-cover" />
            </div>
            <div className="p-6">
              <h2 className="font-display text-3xl">{store.name}</h2>
              <p className="mt-2 flex items-center gap-2 text-ink-soft">
                <IconPin /> {store.address}, {store.city} {store.state} {store.zip}
              </p>
              <p className="mt-1 flex items-center gap-2">
                <IconClock /> {store.hours}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip">{store.waitMinutes} min wait</span>
                {store.hasColdChain ? (
                  <span className="chip">
                    <IconSnowflake className="h-4 w-4" /> Cold-chain
                  </span>
                ) : (
                  <span className="chip">Ambient only</span>
                )}
                <span className="chip">{store.phone}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
