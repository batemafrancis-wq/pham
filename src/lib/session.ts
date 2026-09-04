import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { patients } from "@/db/schema";

export async function getSessionId() {
  const jar = await cookies();
  return jar.get("clarion_sid")?.value ?? "guest";
}

export async function getPatientId() {
  const jar = await cookies();
  const raw = jar.get("clarion_pid")?.value;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export async function getPatient() {
  const id = await getPatientId();
  if (!id) return null;
  const rows = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return rows[0] ?? null;
}
