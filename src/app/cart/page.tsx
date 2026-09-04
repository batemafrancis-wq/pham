import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { getSessionId } from "@/lib/session";
import { findInteractions } from "@/lib/interactions";
import { money } from "@/lib/money";
import { CartControls } from "@/components/cart-controls";
import { IconAlert } from "@/components/icons";

type ProductRow = typeof products.$inferSelect;
type CartItemRow = typeof cartItems.$inferSelect;

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const sessionId = await getSessionId();
  const items: CartItemRow[] = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  const catalog: ProductRow[] = await db.select().from(products);
  const byId: Record<number, ProductRow> = Object.fromEntries(
    catalog.map((p: ProductRow) => [p.id, p]),
  ) as Record<number, ProductRow>;
  const lines = items
    .map((item: CartItemRow) => {
      const product = byId[item.productId];
      if (!product) return null;
      return { ...item, product };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const interactions = await findInteractions(lines.map((l) => l.productId));
  const subtotal = lines.reduce((sum, line) => sum + line.product.priceCents * line.quantity, 0);

  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-5xl">Secure cart</h1>
      <p className="mt-2 text-lg text-ink-soft">
        Split-billing buckets travel with each line. The interaction engine runs before you are allowed to pay.
      </p>
      {interactions.length > 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-alert bg-white p-5">
          <p className="flex items-center gap-2 font-semibold text-alert">
            <IconAlert /> Potential cross-reaction in this basket
          </p>
          {interactions.map((hit) => (
            <div key={hit.left + hit.right} className="mt-3">
              <p className="font-semibold">
                {hit.left} + {hit.right} · {hit.severity}
              </p>
              <p>{hit.description}</p>
              <p className="text-ink-soft">{hit.recommendation}</p>
            </div>
          ))}
          <p className="mt-3 text-sm">A free pharmacist consult checkbox is required at checkout.</p>
        </div>
      ) : null}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {lines.length === 0 ? (
            <p className="rounded-3xl bg-white p-8">Your cart is empty. Visit the marketplace to add clinical OTC or devices.</p>
          ) : null}
          {lines.map((line) => (
            <article key={line.id} className="flex gap-4 rounded-3xl border border-ink/10 bg-white p-4">
              <div className="relative h-28 w-32 overflow-hidden rounded-2xl">
                <Image src={line.product.image} alt="" fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl">{line.product.name}</h2>
                <p className="text-ink-soft">{money(line.product.priceCents)} · billed to {line.billingBucket.toUpperCase()}</p>
                <CartControls id={line.id} quantity={line.quantity} bucket={line.billingBucket} />
              </div>
            </article>
          ))}
        </div>
        <aside className="h-fit rounded-3xl bg-ink p-6 text-cream">
          <p className="text-sm uppercase tracking-[0.16em] text-gold-soft">Order summary</p>
          <p className="mt-4 font-display text-4xl">{money(subtotal)}</p>
          <p className="mt-2 text-cream/75">Tax calculated after identity match. Shipping path chosen in step 2.</p>
          <Link href="/checkout" className="btn btn-gold mt-6 w-full">
            Begin secure checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}
