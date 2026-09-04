import { db } from "@/db";
import { consultations, messages } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getPatient, getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

function reply(body: string) {
  const text = body.toLowerCase();
  if (text.includes("refill")) {
    return "I can queue that refill after I confirm remaining fills on the original prescription. Open Auto-Refill if you want a standing 30/60/90-day cadence.";
  }
  if (text.includes("side") || text.includes("cough") || text.includes("dizzy")) {
    return "Do not stop a blood-pressure medicine suddenly. If you feel faint, sit down, check a home reading, and call 911 for swelling of the face or tongue. I can schedule a 20-minute video block for counseling.";
  }
  if (text.includes("ibuprofen") || text.includes("advil")) {
    return "Ibuprofen can blunt lisinopril and irritate the kidneys, especially over 65. Acetaminophen is usually the safer short-term pain option — I would still like a consult checkbox if both stay in the cart.";
  }
  return "Received. I’m Amara Okonkwo, PharmD. I’ve attached this thread to your sanctuary file. Tell me the medication name and what you need — timing, pickup, or a side-effect check.";
}

export async function POST(request: Request) {
  await ensureSeed();
  const [sessionId, patient] = await Promise.all([getSessionId(), getPatient()]);
  const body = (await request.json()) as { consultationId?: number | null; body?: string };
  if (!body.body?.trim()) {
    return Response.json({ error: "Message required" }, { status: 400 });
  }

  let consultationId = body.consultationId ?? null;
  if (!consultationId) {
    const created = await db
      .insert(consultations)
      .values({
        patientId: patient?.id ?? null,
        sessionId,
        type: "chat",
        status: "open",
        topic: "On-demand pharmacist chat",
        pharmacistName: "Amara Okonkwo, PharmD",
      })
      .returning();
    consultationId = created[0].id;
  }

  await db.insert(messages).values({
    consultationId,
    sender: "patient",
    body: body.body.trim(),
  });
  await db.insert(messages).values({
    consultationId,
    sender: "pharmacist",
    body: reply(body.body),
  });

  return Response.json({ ok: true, consultationId });
}
