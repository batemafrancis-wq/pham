import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { prescriptions } from "@/db/schema";
import { UploadPortal } from "@/components/upload-portal";

export const dynamic = "force-dynamic";

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const rxId = id ? Number(id) : null;
  const current = rxId
    ? (await db.select().from(prescriptions).where(eq(prescriptions.id, rxId)).limit(1))[0]
    : null;

  return (
    <main className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-2">
      <div>
        <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Prescription ingestion</p>
        <h1 className="mt-2 font-display text-5xl">Upload portal</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Drag in a photo of the doctor’s slip. Clarion runs a simulated OCR pass, then shows you the extracted medication for confirmation before a pharmacist signs off.
        </p>
        <UploadPortal initial={current ?? null} />
      </div>
      <div className="space-y-5">
        <div className="photo-frame relative min-h-[320px]">
          <Image src="/images/consult-desk.jpg" alt="Clinician reviewing a prescription with a patient" fill className="object-cover" />
        </div>
        <div className="rounded-3xl bg-ink p-6 text-cream">
          <h2 className="font-display text-3xl">Safety before price</h2>
          <p className="mt-3 text-cream/80">
            We will not show copay or checkout until identity is matched. After OCR, continue to insurance verification or the pharmacist desk.
          </p>
        </div>
      </div>
    </main>
  );
}
