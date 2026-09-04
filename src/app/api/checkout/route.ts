import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, expenses, orders, orderItems, products } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { findInteractions, severityRank } from "@/lib/interactions";
import { getPatient, getSessionId } from "@/lib/session";

type ProductRow = typeof products.$inferSelect;
type CartItemRow = typeof cartItems.$inferSelect;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeed();
  const [sessionId, patient] = await Promise.all([getSessionId(), getPatient()]);
  const body = (await request.json()) as {
    dob?: string;
    otp?: string;
    fulfillment?: string;
    storeId?: number;
    consultAcknowledged?: boolean;
  };

  const expectedDob = patient?.dateOfBirth ?? "1958-03-14";
  if (body.dob !== expectedDob) {
    return Response.json({ error: "Date of birth did not match the patient record." }, { status: 400 });
  }
  if (body.otp !== "4821") {
    return Response.json({ error: "OTP did not match. Use sandbox code 4821." }, { status: 400 });
  }

  const items: CartItemRow[] = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
  if (items.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }
  const catalog: ProductRow[] = await db.select().from(products);
  const byId: Record<number, ProductRow> = Object.fromEntries(
    catalog.map((p: ProductRow) => [p.id, p]),
  ) as Record<number, ProductRow>;
  const interactions = await findInteractions(items.map((i: CartItemRow) => i.productId));
  const serious = interactions.some((hit) => severityRank(hit.severity) >= 2);
  if (serious && !body.consultAcknowledged) {
    return Response.json({ error: "A pharmacist consult acknowledgement is required for this basket." }, { status: 400 });
  }

  let hsa = 0;
  let fsa = 0;
  let personal = 0;
  for (const item of items) {
    const product = byId[item.productId];
    if (!product) continue;
    const line = product.priceCents * item.quantity;
    if (item.billingBucket === "hsa") hsa += line;
    else if (item.billingBucket === "fsa") fsa += line;
    else personal += line;
  }
  const subtotal = hsa + fsa + personal;
  const fulfillment = body.fulfillment ?? "courier";
  const timeline = JSON.stringify([
    {
      label: "Identity matched",
      detail: "Date of birth and OTP verified. Pricing is now unlocked.",
      done: true,
    },
    {
      label: "Pharmacist review",
      detail: serious
        ? "Interaction flagged. A pharmacist will counsel before packing."
        : "A pharmacist is checking the fill against your allergy list.",
      done: true,
    },
    {
      label: "Fulfillment",
      detail:
        fulfillment === "pickup"
          ? "Held at the selected Clarion counter."
          : fulfillment === "coldchain"
            ? "Packed in validated cold-chain at Harbor Hub."
            : "Clinical courier is staged for metro delivery.",
      done: true,
    },
    {
      label: "Clinical courier deployment",
      detail: "Tracking updates when the sealed tote leaves the hub.",
      done: fulfillment !== "pickup",
    },
  ]);

  const inserted = await db
    .insert(orders)
    .values({
      patientId: patient?.id ?? null,
      sessionId,
      status: "review",
      fulfillment,
      storeId: body.storeId ?? null,
      subtotalCents: subtotal,
      hsaCents: hsa,
      fsaCents: fsa,
      personalCents: personal,
      dobVerified: true,
      consultAcknowledged: Boolean(body.consultAcknowledged),
      timeline,
    })
    .returning();
  const order = inserted[0];

  for (const item of items) {
    const product = byId[item.productId];
    if (!product) continue;
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: product.id,
      quantity: item.quantity,
      priceCents: product.priceCents,
      billingBucket: item.billingBucket,
    });
  }

  if (patient) {
    await db.insert(expenses).values({
      patientId: patient.id,
      label: `Order #${order.id}`,
      category: "Checkout",
      amountCents: subtotal,
      hsaCents: hsa,
      fsaCents: fsa,
      occurredOn: new Date().toISOString().slice(0, 10),
    });
  }

  await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  return Response.json({ id: order.id });
}
