import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await ensureSeed();
  const body = (await request.json()) as { email?: string; dateOfBirth?: string };
  const email = body.email?.toLowerCase().trim();
  const dateOfBirth = body.dateOfBirth?.trim();
  if (!email || !dateOfBirth) {
    return Response.json({ error: "Email and date of birth are required" }, { status: 400 });
  }
  const rows = await db
    .select()
    .from(patients)
    .where(and(eq(patients.email, email), eq(patients.dateOfBirth, dateOfBirth)))
    .limit(1);
  const patient = rows[0];
  if (!patient) {
    return Response.json({ error: "No match" }, { status: 401 });
  }
  const jar = await cookies();
  jar.set("clarion_pid", String(patient.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return Response.json({ ok: true, name: patient.name });
}
