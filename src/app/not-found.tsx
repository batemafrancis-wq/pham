import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-display text-5xl">Page not in the formulary</h1>
      <p className="mt-3 text-lg text-ink-soft">That route is not on the Clarion sitemap.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Return home
      </Link>
    </main>
  );
}
