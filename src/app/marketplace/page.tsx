import Image from "next/image";
import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

const categories = [
  {
    key: "otc",
    title: "OTC Remedies",
    copy: "Cough & cold, pain relief, allergy, first aid — labeled in 16px+ type.",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "chronic",
    title: "Chronic Care",
    copy: "Diabetes supplies, blood pressure monitors, respiratory devices.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "wellness",
    title: "Vitamins & Wellness",
    copy: "Supplements and medical-grade skincare, with interaction notes.",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
  },
];

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; symptom?: string }>;
}) {
  const params = await searchParams;
  const all = await db.select().from(products);
  const filtered = all.filter((product) => {
    if (params.category && product.category !== params.category) return false;
    if (params.symptom && !product.symptomTags.toLowerCase().includes(params.symptom.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Clinical & OTC marketplace</p>
      <h1 className="mt-2 font-display text-5xl">A highly structured product matrix</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-soft">
        Every card states HSA eligibility, Rx status, and the clinical aisle. No dark patterns. No 12px footnotes.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.key} href={`/marketplace/${cat.key}`} className="group relative min-h-56 overflow-hidden rounded-3xl">
            <Image src={cat.image} alt={cat.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-ink/50 transition group-hover:bg-ink/40" />
            <div className="absolute bottom-5 left-5 right-5 text-cream">
              <h2 className="font-display text-3xl">{cat.title}</h2>
              <p className="mt-1 text-cream/85">{cat.copy}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/marketplace" className="chip">
          All
        </Link>
        {["cold", "pain", "allergy", "diabetes", "sleep", "heart"].map((tag) => (
          <Link key={tag} href={`/marketplace?symptom=${tag}`} className="chip">
            {tag}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
