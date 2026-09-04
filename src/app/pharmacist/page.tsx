import Image from "next/image";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { prescriptions } from "@/db/schema";
import { PharmacistDesk } from "@/components/pharmacist-desk";

export const dynamic = "force-dynamic";

export default async function PharmacistPage() {
  const queue = await db.select().from(prescriptions).orderBy(desc(prescriptions.createdAt));

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Internal clinical desk</p>
          <h1 className="mt-2 font-display text-5xl">Pharmacist verification dashboard</h1>
          <p className="mt-3 text-lg text-ink-soft">
            Review OCR, match identity, and approve or send back a slip. This desk is the human gate before fulfillment.
          </p>
          <div className="photo-frame relative mt-6 min-h-[280px]">
            <Image
              src="https://images.unsplash.com/photo-1538108149393-fbbd81895977?auto=format&fit=crop&w=1200&q=80"
              alt="Pharmacists collaborating at the verification counter"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <PharmacistDesk
          queue={queue.map((rx) => ({
            id: rx.id,
            fileName: rx.fileName,
            imagePath: rx.imagePath,
            ocrText: rx.ocrText,
            status: rx.status,
            medicationName: rx.medicationName,
            dosage: rx.dosage,
            prescriber: rx.prescriber,
            ndc: rx.ndc,
          }))}
        />
      </div>
    </main>
  );
}
