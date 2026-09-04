import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { prescriptions } from "@/db/schema";
import { getPatient, getSessionId } from "@/lib/session";
import { IconLock, IconShield } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function PrescriptionCenterPage() {
  const [patient, sessionId] = await Promise.all([getPatient(), getSessionId()]);
  const rows = patient
    ? await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.patientId, patient.id))
        .orderBy(desc(prescriptions.createdAt))
    : await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.sessionId, sessionId))
        .orderBy(desc(prescriptions.createdAt));

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-cream">
        <Image
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&q=80"
          alt="Prescription pad on a clinical desk"
          fill
          className="object-cover opacity-35"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-20">
          <p className="flex items-center gap-2 text-sm uppercase tracking-[0.18em]">
            <IconLock /> HIPAA / data-privacy workspace
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl md:text-6xl">Digital Prescription Center</h1>
          <p className="mt-4 max-w-2xl text-xl text-cream/85">
            Upload a slip, review OCR before it becomes a fill, schedule auto-refill, and estimate copays before you ever see a payment field.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-12 md:grid-cols-3">
        {[
          {
            href: "/prescriptions/upload",
            title: "Upload portal",
            copy: "Drag-and-drop a doctor’s slip. Watch OCR, then confirm the medication, dose, and prescriber.",
            image:
              "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
          },
          {
            href: "/prescriptions/refills",
            title: "Auto-refill manager",
            copy: "Choose 30/60/90-day cadence and whether a courier or a local counter should handle it.",
            image:
              "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
          },
          {
            href: "/prescriptions/insurance",
            title: "Insurance engine",
            copy: "Real-time copay estimator and co-insurance matrix against Harbor Blue and similar PPO plans.",
            image:
              "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
          },
        ].map((card) => (
          <Link key={card.href} href={card.href} className="overflow-hidden rounded-3xl bg-white shadow-lg">
            <div className="relative h-44">
              <Image src={card.image} alt="" fill className="object-cover" />
            </div>
            <div className="p-6">
              <h2 className="font-display text-3xl">{card.title}</h2>
              <p className="mt-2 text-ink-soft">{card.copy}</p>
            </div>
          </Link>
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="flex items-center gap-2 text-ink-soft">
          <IconShield /> Files in this workspace are encrypted at rest in the sandbox database.
        </div>
        <h2 className="mt-4 font-display text-3xl">Your prescription file</h2>
        <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-white">
          <table className="w-full text-left text-[1.02rem]">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3">Medication</th>
                <th className="px-4 py-3">Prescriber</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Refills</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((rx) => (
                <tr key={rx.id} className="border-t border-ink/10">
                  <td className="px-4 py-3">{rx.medicationName ?? rx.fileName}</td>
                  <td className="px-4 py-3">{rx.prescriber ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{rx.status}</td>
                  <td className="px-4 py-3">{rx.refillsRemaining ?? "—"}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-ink-soft" colSpan={4}>
                    No slips yet. Upload a prescription to open a review ticket.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
