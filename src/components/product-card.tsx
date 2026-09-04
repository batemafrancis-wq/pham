import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/money";

export type ProductCardData = {
  slug: string;
  name: string;
  brand: string;
  image: string;
  priceCents: number;
  hsaEligible: boolean;
  rxRequired: boolean;
  subcategory: string;
  rating: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_12px_30px_rgba(11,28,36,0.06)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.rxRequired ? <span className="chip bg-ink text-cream">Rx</span> : null}
          {product.hsaEligible ? <span className="chip">HSA/FSA</span> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm uppercase tracking-[0.14em] text-ink-soft">{product.subcategory}</p>
        <h3 className="mt-1 font-display text-2xl">{product.name}</h3>
        <p className="text-ink-soft">{product.brand}</p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="text-xl font-semibold">{money(product.priceCents)}</p>
          <p className="text-sm text-ink-soft">{product.rating.toFixed(1)} ★</p>
        </div>
      </div>
    </Link>
  );
}
