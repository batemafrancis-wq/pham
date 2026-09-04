import Image from "next/image";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { prescriptions } from "@/db/schema";
import { getPatient } from "@/lib/session";
import { money } from "@/lib/money";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InsurancePage() {
  const patient = await getPatient();
  const rxs = patient
    ? await db.select().from(prescriptions).where(eq(prescriptions.patientId, patient.id))
    : [];

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Real-time copay estimator</p>
      <h1 className="mt-2 font-display text-5xl">Insurance verification engine</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-soft">
        Copay and co-insurance are estimated against the plan on file before you ever enter a card. This is a sandbox estimator, not a live payer connection.
      </p>
      {!patient ? (
        <Link href="/login" className="btn btn-primary mt-8">
          Sign in to load your plan
        </Link>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
            <div className="bg-cream px-5 py-4">
              <p className="font-semibold">{patient.insurancePlan}</p>
              <p className="text-sm text-ink-soft">Member {patient.memberId} · Deductible remaining $240</p>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/10">
                  <th className="px-4 py-3">Medication</th>
                  <th className="px-4 py-3">Est. copay</th>
                  <th className="px-4 py-3">Co-insurance</th>
                  <th className="px-4 py-3">You pay today</th>
                </tr>
              </thead>
              <tbody>
                {rxs.map((rx) => (
                  <tr key={rx.id} className="border-b border-ink/5">
                    <td className="px-4 py-3">{rx.medicationName}</td>
                    <td className="px-4 py-3">{money(rx.copayCents ?? 0)}</td>
                    <td className="px-4 py-3">{rx.coinsurancePct ?? 0}%</td>
                    <td className="px-4 py-3 font-semibold">{money(rx.copayCents ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid gap-3 p-5 md:grid-cols-3">
              <div className="rounded-2xl bg-cream p-4">
                <p className="text-sm text-ink-soft">HSA available</p>
                <p className="font-display text-3xl">{money(patient.hsaBalanceCents)}</p>
              </div>
              <div className="rounded-2xl bg-cream p-4">
                <p className="text-sm text-ink-soft">FSA available</p>
                <p className="font-display text-3xl">{money(patient.fsaBalanceCents)}</p>
              </div>
              <div className="rounded-2xl bg-ink p-4 text-cream">
                <p className="text-sm text-gold-soft">Plan design</p>
                <p className="mt-1">Tier 1 generics 10% after copay · Preferred pharmacy network includes all Clarion hubs.</p>
              </div>
            </div>
          </div>
          <div className="photo-frame relative min-h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80"
              alt="Pharmacist documenting insurance verification"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
    </main>
  );
}
