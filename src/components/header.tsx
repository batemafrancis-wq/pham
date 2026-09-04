import Link from "next/link";
import { IconCart, IconLock, IconPin, IconShield, IconUser, IconVideo } from "@/components/icons";
import { MiniUpload } from "@/components/mini-upload";

const nav = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/prescriptions", label: "Prescriptions" },
  { href: "/telehealth", label: "Telehealth" },
  { href: "/stores", label: "Stores" },
  { href: "/dashboard", label: "Sanctuary" },
];

export function Header({
  cartCount,
  patientName,
}: {
  cartCount: number;
  patientName: string | null;
}) {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-teal-deep text-cream">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-2 text-[0.92rem]">
          <p className="flex items-center gap-2">
            <IconLock className="h-4 w-4" />
            HIPAA-aligned workspace · 256-bit encryption in transit
          </p>
          <p className="flex items-center gap-2">
            <IconShield className="h-4 w-4" />
            NABP Digital Pharmacy · Licensed in 18 states
          </p>
        </div>
      </div>
      <div className="border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-teal text-cream font-display text-xl">
              C
            </span>
            <span>
              <span className="block font-display text-2xl leading-none">Clarion</span>
              <span className="block text-xs uppercase tracking-[0.22em] text-ink-soft">Pharmacy</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-[1.02rem] lg:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-teal">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <MiniUpload />
            <Link href="/telehealth" className="btn btn-ghost hidden sm:inline-flex">
              <IconVideo /> Telehealth
            </Link>
            <Link href="/stores" className="btn btn-ghost hidden md:inline-flex">
              <IconPin /> Stores
            </Link>
            <Link href="/cart" className="btn btn-ink relative">
              <IconCart />
              Secure cart
              <span className="ml-1 grid h-6 min-w-6 place-items-center rounded-full bg-gold px-1 text-sm text-ink">
                {cartCount}
              </span>
            </Link>
            {patientName ? (
              <Link href="/dashboard" className="btn btn-ghost">
                <IconUser /> {patientName.split(" ")[0]}
              </Link>
            ) : (
              <Link href="/login" className="btn btn-ghost">
                <IconUser /> Sign in
              </Link>
            )}
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-5 pb-3 text-sm lg:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-ink-soft">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}


