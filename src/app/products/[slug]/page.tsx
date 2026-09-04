import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { money } from "@/lib/money";
import { AddToCart } from "@/components/add-to-cart";
import { DualLayer } from "@/components/dual-layer";
import { ProductCard } from "@/components/product-card";
import { IconSnowflake } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  const product = rows[0];
  if (!product) notFound();
  const related = (await db.select().from(products))
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <p className="text-sm">
        <Link href="/marketplace" className="text-teal">
          Marketplace
        </Link>{" "}
        / {product.subcategory}
      </p>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="photo-frame relative min-h-[420px]">
          <Image src={product.image} alt={product.name} fill className="object-cover" priority />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-ink-soft">{product.brand}</p>
          <h1 className="mt-2 font-display text-5xl">{product.name}</h1>
          <p className="mt-4 text-lg">{product.shortDescription}</p>
          <p className="mt-5 font-display text-4xl">{money(product.priceCents)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.rxRequired ? <span className="chip bg-ink text-cream">Prescription required</span> : <span className="chip">OTC</span>}
            {product.hsaEligible ? <span className="chip">HSA eligible</span> : null}
            {product.fsaEligible ? <span className="chip">FSA eligible</span> : null}
            {product.requiresColdChain ? (
              <span className="chip">
                <IconSnowflake className="h-4 w-4" /> Cold-chain
              </span>
            ) : null}
            <span className="chip">{product.stock} in hub</span>
          </div>
          <div className="mt-8 rounded-3xl border border-ink/10 bg-white p-6">
            <AddToCart
              productId={product.id}
              hsaEligible={product.hsaEligible}
              fsaEligible={product.fsaEligible}
              rxRequired={product.rxRequired}
            />
          </div>
        </div>
      </div>
      <DualLayer
        usage={product.usage}
        dosage={product.dosage}
        warnings={product.warnings}
        activeIngredients={product.activeIngredients}
        interactions={product.interactions}
        clinicalNotes={product.clinicalNotes}
        clinicalTrials={product.clinicalTrials}
      />
      <section className="mt-14">
        <h2 className="font-display text-3xl">In the same aisle</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
