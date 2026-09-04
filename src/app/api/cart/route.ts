import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cartItems } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeed();
  const sessionId = await getSessionId();
  const body = (await request.json()) as {
    productId?: number;
    quantity?: number;
    billingBucket?: string;
  };
  if (!body.productId) {
    return Response.json({ error: "productId required" }, { status: 400 });
  }
  const bucket = body.billingBucket ?? "personal";
  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.sessionId, sessionId), eq(cartItems.productId, body.productId), eq(cartItems.billingBucket, bucket)),
    )
    .limit(1);
  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + (body.quantity ?? 1) })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      sessionId,
      productId: body.productId,
      quantity: body.quantity ?? 1,
      billingBucket: bucket,
    });
  }
  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  const sessionId = await getSessionId();
  const body = (await request.json()) as {
    id?: number;
    quantity?: number;
    billingBucket?: string;
  };
  if (!body.id) return Response.json({ error: "id required" }, { status: 400 });
  const rows = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.id, body.id), eq(cartItems.sessionId, sessionId)))
    .limit(1);
  if (!rows[0]) return Response.json({ error: "Not found" }, { status: 404 });
  if (typeof body.quantity === "number" && body.quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, body.id));
    return Response.json({ ok: true });
  }
  await db
    .update(cartItems)
    .set({
      quantity: body.quantity ?? rows[0].quantity,
      billingBucket: body.billingBucket ?? rows[0].billingBucket,
    })
    .where(eq(cartItems.id, body.id));
  return Response.json({ ok: true });
}
