import { db } from "@/db";
import { consultations } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getPatient, getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeed();
  const [sessionId, patient] = await Promise.all([getSessionId(), getPatient()]);
  const body = (await request.json()) as { scheduledAt?: string; topic?: string };
  if (!body.scheduledAt) {
    return Response.json({ error: "Slot required" }, { status: 400 });
  }
  const created = await db
    .insert(consultations)
    .values({
      patientId: patient?.id ?? null,
      sessionId,
      type: "video",
      scheduledAt: body.scheduledAt,
      status: "scheduled",
      topic: body.topic ?? "Medication review",
      pharmacistName: "Priya Raman, PharmD, BCPS",
    })
    .returning();
  return Response.json(created[0]);
}
