import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { patientMedications, products } from "@/db/schema";
import { getPatient } from "@/lib/session";
import { ProductCard } from "@/components/product-card";
import { IconArrow, IconCheck, IconShield, IconSnowflake, IconTruck } from "@/components/icons";

export const dynamic = "force-dynamic";

const symptoms = [
  { label: "Cough & cold", href: "/marketplace?symptom=cold", image: "/images/cold.jpg" },
  { label: "Pain & fever", href: "/marketplace?symptom=pain", image: "/images/pills-blue.jpg" },
  { label: "Allergy season", href: "/marketplace?symptom=allergy", image: "/images/pills-white.jpg" },
  { label: "Blood pressure", href: "/marketplace?category=chronic", image: "/images/bp.jpg" },
  { label: "Diabetes kit", href: "/marketplace?symptom=diabetes", image: "/images/glucose.jpg" },
  { label: "Sleep & recovery", href: "/marketplace?symptom=sleep", image: "/images/capsules-jar.jpg" },
];

export default async function HomePage() {
  const patient = await getPatient();
  const featured = await db.select().from(products).limit(6);
  const meds = patient
    ? await db.select().from(patientMedications).where(eq(patientMedications.patientId, patient.id))
    : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <main>
      <section className="relative min-h-[88vh] overflow-hidden bg-ink text-cream">
        <Image
          src="/images/hero-pharmacy.jpg"
          alt="Pharmacists working at a Clarion clinical counter"
          fill
          priority
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
        <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="chip bg-white/10 text-cream border-cream/20">
              {patient ? "Authenticated patient view" : "Guest visitor view"}
            </p>
            <h1 className="mt-5 font-display text-[clamp(3rem,7vw,5.6rem)] text-cream">
              {patient ? `${greeting}, ${patient.name.split(" ")[0]}.` : "Clinical certainty, delivered."}
            </h1>
            <p className="mt-5 max-w-xl text-xl text-cream/85">
              {patient
                ? "Your refill rail is live. A board-certified pharmacist still reviews every prescription before it leaves the hub."
                : "Upload a doctor’s slip, map a symptom to the right shelf, or sit with a pharmacist on demand — without sacrificing privacy or print-sized type."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/prescriptions/upload" className="btn btn-gold">
                Upload a prescription <IconArrow />
              </Link>
              <Link href="/marketplace" className="btn btn-ghost border-cream/40 text-cream">
                Shop clinical OTC
              </Link>
              <Link href="/telehealth" className="btn btn-ghost border-cream/40 text-cream">
                Enter telehealth lounge
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-cream p-6 text-ink shadow-2xl">
              <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Verified metrics</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ["12 min", "median Rx review"],
                  ["99.2%", "interaction catch rate"],
                  ["4.9", "pharmacist rating"],
                ].map(([stat, label]) => (
                  <div key={label}>
                    <p className="font-display text-3xl">{stat}</p>
                    <p className="text-sm text-ink-soft">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="photo-frame relative h-64">
              <Image
                src="/images/hero-consult.jpg"
                alt="Pharmacist handing a verified bottle to a patient"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {patient ? (
        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Fast-refill rail</p>
              <h2 className="font-display text-4xl">Active medication reminders</h2>
            </div>
            <Link href="/dashboard" className="btn btn-ghost">
              Open Patient Sanctuary
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {meds.map((med) => (
              <article key={med.id} className="rounded-3xl border border-ink/10 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl">{med.name}</h3>
                  {med.refillDue ? <span className="chip bg-gold">Refill due</span> : <span className="chip">On track</span>}
                </div>
                <p className="mt-3 text-ink-soft">{med.instructions}</p>
                <p className="mt-4 text-lg">
                  Next dose: <strong>{med.nextDoseAt}</strong>
                </p>
                <p className="text-sm">{med.remainingDoses} doses remaining</p>
                {med.refillDue ? (
                  <Link href="/prescriptions/refills" className="btn btn-primary mt-5">
                    Refill now
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-5 py-16">
          <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Symptom-to-category mapping</p>
          <h2 className="font-display text-4xl">Tell us what hurts. We’ll show the right aisle.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {symptoms.map((item) => (
              <Link key={item.label} href={item.href} className="group relative min-h-48 overflow-hidden rounded-3xl">
                <Image src={item.image} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <p className="absolute bottom-5 left-5 font-display text-3xl text-cream">{item.label}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-cream py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2">
          <div className="photo-frame relative min-h-[420px]">
            <Image src="/images/pharmacist.jpg" alt="Clarion pharmacist in the clinical bay" fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="gold-rule" />
            <h2 className="mt-5 font-display text-5xl">A pharmacy that reads like a clinic, not a catalog.</h2>
            <ul className="mt-6 space-y-4 text-lg">
              <li className="flex gap-3">
                <IconCheck className="mt-1 text-teal" /> Dual-layer monographs: plain language, then the professional file.
              </li>
              <li className="flex gap-3">
                <IconShield className="mt-1 text-teal" /> Interaction engine scans every basket before money moves.
              </li>
              <li className="flex gap-3">
                <IconTruck className="mt-1 text-teal" /> Same-day courier or counter pickup, with cold-chain called out in plain sight.
              </li>
              <li className="flex gap-3">
                <IconSnowflake className="mt-1 text-teal" /> HSA and FSA cards split from personal cards in one settlement.
              </li>
            </ul>
            <Link href="/prescriptions" className="btn btn-primary mt-8 w-fit">
              Enter the Prescription Center
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-4xl">Clinical marketplace</h2>
          <Link href="/marketplace" className="text-teal">
            View the full matrix
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 lg:grid-cols-2">
        <Link href="/telehealth" className="relative min-h-80 overflow-hidden rounded-3xl">
          <Image src="/images/telehealth.jpg" alt="Pharmacist on a video consult" fill className="object-cover" />
          <div className="absolute inset-0 bg-ink/45" />
          <div className="absolute bottom-6 left-6 text-cream">
            <p className="uppercase tracking-[0.18em] text-sm">Secure lounge</p>
            <h3 className="font-display text-4xl">Pharmacist on-demand chat</h3>
          </div>
        </Link>
        <Link href="/stores" className="relative min-h-80 overflow-hidden rounded-3xl">
          <Image src="/images/delivery-courier.jpg" alt="Clinical courier carrying a sealed parcel" fill className="object-cover" />
          <div className="absolute inset-0 bg-ink/45" />
          <div className="absolute bottom-6 left-6 text-cream">
            <p className="uppercase tracking-[0.18em] text-sm">Fulfillment</p>
            <h3 className="font-display text-4xl">Find a store or cold-chain hub</h3>
          </div>
        </Link>
      </section>
    </main>
  );
}
