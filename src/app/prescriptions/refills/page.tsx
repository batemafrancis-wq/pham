import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { prescriptions, refillSchedules } from "@/db/schema";
import { getPatient } from "@/lib/session";
import { RefillManager } from "@/components/refill-manager";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RefillPage() {
  const patient = await getPatient();
  if (!patient) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="font-display text-4xl">Sign in to manage auto-refill</h1>
        <p className="mt-3 text-lg text-ink-soft">Refill schedules attach to a verified patient record.</p>
        <Link href="/login" className="btn btn-primary mt-6">
          Patient sign-in
        </Link>
      </main>
    );
  }

  const rxs = await db.select().from(prescriptions).where(eq(prescriptions.patientId, patient.id));
  const schedules = await db.select().from(refillSchedules).where(eq(refillSchedules.patientId, patient.id));

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Schedule controls</p>
          <h1 className="mt-2 font-display text-5xl">Auto-refill manager</h1>
          <p className="mt-3 text-lg text-ink-soft">
            Choose delivery frequency and whether the next fill rides a courier or waits at a Clarion counter.
          </p>
          <RefillManager
            prescriptions={rxs.map((rx) => ({
              id: rx.id,
              name: rx.medicationName ?? "Untitled",
              remaining: rx.refillsRemaining ?? 0,
              next: rx.nextRefillAt,
            }))}
            schedules={schedules.map((s) => ({
              id: s.id,
              prescriptionId: s.prescriptionId,
              frequency: s.frequency,
              deliveryMethod: s.deliveryMethod,
              active: s.active,
            }))}
          />
        </div>
        <div className="photo-frame relative min-h-[360px]">
          <Image src="/images/pills-hand.jpg" alt="Patient holding a prescription bottle" fill className="object-cover" />
        </div>
      </div>
    </main>
  );
}
