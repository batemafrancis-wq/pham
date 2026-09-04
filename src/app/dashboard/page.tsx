import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { expenses, orders, patientMedications, prescriptions } from "@/db/schema";
import { getPatient } from "@/lib/session";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const patient = await getPatient();
  if (!patient) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="font-display text-4xl">Patient Sanctuary is locked</h1>
        <p className="mt-3 text-lg">Sign in with the demo record to see medications, interactions, and expense statements.</p>
        <Link href="/login" className="btn btn-primary mt-6">
          Open the sanctuary
        </Link>
      </main>
    );
  }

  const [meds, rxs, spend, recentOrders] = await Promise.all([
    db.select().from(patientMedications).where(eq(patientMedications.patientId, patient.id)),
    db.select().from(prescriptions).where(eq(prescriptions.patientId, patient.id)),
    db.select().from(expenses).where(eq(expenses.patientId, patient.id)),
    db.select().from(orders).where(eq(orders.patientId, patient.id)).orderBy(desc(orders.createdAt)).limit(5),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Medical profile</p>
          <h1 className="mt-2 font-display text-5xl">{patient.name}</h1>
          <p className="mt-2 text-lg text-ink-soft">
            DOB {patient.dateOfBirth} · {patient.insurancePlan} · Allergies: {patient.allergies}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm">HSA</p>
              <p className="font-display text-3xl">{money(patient.hsaBalanceCents)}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm">FSA</p>
              <p className="font-display text-3xl">{money(patient.fsaBalanceCents)}</p>
            </div>
            <div className="rounded-2xl bg-teal p-4 text-cream">
              <p className="text-sm">Verified member since</p>
              <p className="font-display text-3xl">{patient.memberSince.slice(0, 4)}</p>
            </div>
          </div>
        </div>
        <div className="photo-frame relative min-h-[260px]">
          <Image src="/images/patient-tablet.jpg" alt="Patient reviewing medications during a virtual visit" fill className="object-cover" />
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Active medications</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {meds.map((med) => (
            <article key={med.id} className="rounded-3xl border border-ink/10 bg-white p-5">
              <h3 className="font-display text-2xl">{med.name}</h3>
              <p className="mt-2">{med.instructions}</p>
              <p className="mt-3 text-sm">Next: {med.nextDoseAt}</p>
              {med.refillDue ? <p className="mt-2 font-semibold text-warn">Refill due</p> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Drug interaction log</h2>
          <ul className="mt-4 space-y-3">
            <li className="rounded-2xl bg-white p-4">
              Watch pairing: ibuprofen with lisinopril — kidney and blood-pressure effect. Prefer acetaminophen for short pain.
            </li>
            <li className="rounded-2xl bg-white p-4">
              High-dose vitamin C may perturb glucometer strips. Wash hands before testing.
            </li>
            <li className="rounded-2xl bg-white p-4">No severe interactions on the current verified profile.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-3xl">Expense statements</h2>
          <table className="mt-4 w-full rounded-3xl bg-white text-left">
            <thead>
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {spend.map((row) => (
                <tr key={row.id} className="border-t border-ink/10">
                  <td className="px-4 py-3">{row.occurredOn}</td>
                  <td className="px-4 py-3">
                    {row.label}
                    <span className="block text-sm text-ink-soft">
                      HSA {money(row.hsaCents)} · FSA {money(row.fsaCents)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{money(row.amountCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Prescription file</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {rxs.map((rx) => (
            <article key={rx.id} className="rounded-3xl bg-cream p-5">
              <p className="text-sm uppercase tracking-[0.14em]">{rx.status}</p>
              <h3 className="font-display text-2xl">{rx.medicationName}</h3>
              <p>{rx.prescriber}</p>
              <p className="text-sm">{rx.dosage}</p>
            </article>
          ))}
        </div>
      </section>

      {recentOrders.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl">Recent fulfillment</h2>
          <ul className="mt-4 space-y-2">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link href={`/orders/${order.id}`} className="text-teal">
                  Order #{order.id} · {order.status} · {money(order.subtotalCents)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
