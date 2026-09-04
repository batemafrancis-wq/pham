import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, products, stores } from "@/db/schema";
import { getPatient, getSessionId } from "@/lib/session";
import { findInteractions } from "@/lib/interactions";
import { CheckoutPipeline } from "@/components/checkout-pipeline";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [sessionId, patient, storeRows, catalog] = await Promise.all([
    getSessionId(),
    getPatient(),
    db.select().from(stores),
    db.select().from(products),
  ]);
  const items = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));
  const lines = items
    .map((item) => {
      const product = byId[item.productId];
      if (!product) return null;
      return {
        id: item.id,
        quantity: item.quantity,
        billingBucket: item.billingBucket,
        productId: product.id,
        name: product.name,
        priceCents: product.priceCents,
        hsaEligible: product.hsaEligible,
        fsaEligible: product.fsaEligible,
        requiresColdChain: product.requiresColdChain,
        image: product.image,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const interactions = await findInteractions(lines.map((l) => l.productId));

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <p className="text-sm uppercase tracking-[0.18em] text-ink-soft">Frictionless secure checkout</p>
      <h1 className="mt-2 font-display text-5xl">Settlement pipeline</h1>
      <CheckoutPipeline
        lines={lines}
        interactions={interactions}
        stores={storeRows.map((s) => ({
          id: s.id,
          name: s.name,
          address: `${s.address}, ${s.city}`,
          waitMinutes: s.waitMinutes,
          hasColdChain: s.hasColdChain,
        }))}
        expectedDob={patient?.dateOfBirth ?? "1958-03-14"}
        patientName={patient?.name ?? "Guest patient"}
        hsaBalance={patient?.hsaBalanceCents ?? 0}
        fsaBalance={patient?.fsaBalanceCents ?? 0}
      />
    </main>
  );
}
