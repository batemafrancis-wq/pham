import { eq } from "drizzle-orm";
import { db } from "@/db";
import { prescriptions } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeed();
  const body = (await request.json()) as { id?: number; status?: string };
  if (!body.id || !body.status) {
    return Response.json({ error: "id and status required" }, { status: 400 });
  }
  await db.update(prescriptions).set({ status: body.status }).where(eq(prescriptions.id, body.id));
  return Response.json({ ok: true });
}
