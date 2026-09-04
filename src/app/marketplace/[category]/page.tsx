import { notFound } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

const copy: Record<string, { title: string; intro: string }> = {
  otc: {
    title: "OTC Remedies",
    intro: "Cough & cold, pain relief, allergy, and first aid — consumer language on the front, monographs one tap away.",
  },
  chronic: {
    title: "Chronic Care Products",
    intro: "Diabetes supplies, blood pressure monitors, inhalers, and pulse oximetry for daily disease management.",
  },
  wellness: {
    title: "Vitamins & Wellness",
    intro: "Supplements and medical-grade skincare, flagged when they collide with prescriptions in your basket.",
  },
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = copy[category];
  if (!meta) notFound();
  const rows = (await db.select().from(products)).filter((p) => p.category === category);

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Marketplace</p>
      <h1 className="mt-2 font-display text-5xl">{meta.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-soft">{meta.intro}</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
