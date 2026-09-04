import Link from "next/link";
import { IconLock, IconShield } from "@/components/icons";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div>
          <p className="font-display text-3xl">Clarion Pharmacy</p>
          <p className="mt-3 text-cream/80">
            Clinical-grade fulfillment with a human pharmacist on every verified order. Licensed digital pharmacy.
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-gold-soft">Care</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/prescriptions">Digital Prescription Center</Link>
            </li>
            <li>
              <Link href="/telehealth">Pharmacist lounge</Link>
            </li>
            <li>
              <Link href="/marketplace">OTC & chronic care</Link>
            </li>
            <li>
              <Link href="/pharmacist">Pharmacist verification desk</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-gold-soft">Trust</p>
          <ul className="mt-3 space-y-2">
            <li>HIPAA Notice of Privacy Practices</li>
            <li>NABP .pharmacy verified</li>
            <li>Cold-chain validated packaging</li>
            <li>HSA / FSA split settlement</li>
          </ul>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-gold-soft">Contact</p>
          <p className="mt-3">Clinical desk 24/7 · (617) 555-0190</p>
          <p>privacy@clarion.health</p>
          <p className="mt-4 flex items-center gap-2 text-cream/80">
            <IconLock /> Encrypted session
          </p>
          <p className="flex items-center gap-2 text-cream/80">
            <IconShield /> Board-certified pharmacists
          </p>
        </div>
      </div>
      <div className="border-t border-cream/15 px-5 py-4 text-center text-sm text-cream/70">
        For education and fulfillment support. This sandbox does not dispense controlled substances. © Clarion Pharmacy.
      </div>
    </footer>
  );
}
