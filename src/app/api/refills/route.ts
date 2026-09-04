import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { refillSchedules } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getPatient } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeed();
  const patient = await getPatient();
  if (!patient) return Response.json({ error: "Sign in required" }, { status: 401 });
  const body = (await request.json()) as {
    prescriptionId?: number;
    frequency?: string;
    deliveryMethod?: string;
    active?: boolean;
  };
  if (!body.prescriptionId || !body.frequency || !body.deliveryMethod) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }
  const existing = await db
    .select()
    .from(refillSchedules)
    .where(and(eq(refillSchedules.patientId, patient.id), eq(refillSchedules.prescriptionId, body.prescriptionId)))
    .limit(1);
  if (existing[0]) {
    await db
      .update(refillSchedules)
      .set({
        frequency: body.frequency,
        deliveryMethod: body.deliveryMethod,
        active: body.active ?? true,
      })
      .where(eq(refillSchedules.id, existing[0].id));
  } else {
    await db.insert(refillSchedules).values({
      patientId: patient.id,
      prescriptionId: body.prescriptionId,
      frequency: body.frequency,
      deliveryMethod: body.deliveryMethod,
      active: body.active ?? true,
    });
  }
  return Response.json({ ok: true });
}
