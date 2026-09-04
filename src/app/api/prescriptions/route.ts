import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/db";
import { prescriptions } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getPatient, getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

const samples = [
  {
    medicationName: "Lisinopril 10 mg",
    dosage: "Take one tablet by mouth daily",
    prescriber: "Helen Cho, MD",
    ndc: "68180-0512-03",
    ocrText:
      "Dr. Helen Cho, MD · Harbor Cardiology\nRx: Lisinopril 10 mg tablet\nSig: Take one tablet by mouth daily\nQty: 90  Refills: 3",
    copayCents: 700,
    coinsurancePct: 10,
    refillsRemaining: 3,
    nextRefillAt: "2026-04-18",
  },
  {
    medicationName: "Metformin 500 mg",
    dosage: "Take one tablet by mouth twice daily with meals",
    prescriber: "Anika Patel, MD",
    ndc: "0093-1074-01",
    ocrText:
      "Dr. Anika Patel, MD · Brookline Endocrine\nRx: Metformin 500 mg\nSig: Take one tablet twice daily with meals\nQty: 60  Refills: 5",
    copayCents: 400,
    coinsurancePct: 10,
    refillsRemaining: 5,
    nextRefillAt: "2026-04-08",
  },
  {
    medicationName: "Airwell Respimat",
    dosage: "Two inhalations once daily",
    prescriber: "Samuel Rhee, MD",
    ndc: "0597-0101-90",
    ocrText:
      "Dr. Samuel Rhee, MD · Pulmonary Associates\nRx: Airwell Respimat\nSig: Two inhalations once daily\nQty: 1  Refills: 2",
    copayCents: 3500,
    coinsurancePct: 20,
    refillsRemaining: 2,
    nextRefillAt: "2026-04-22",
  },
];

export async function POST(request: Request) {
  await ensureSeed();
  const [sessionId, patient] = await Promise.all([getSessionId(), getPatient()]);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "File required" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, "")}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const diskPath = path.join(dir, safeName);
  await writeFile(diskPath, bytes);

  const extracted = samples[Math.floor(Math.random() * samples.length)];
  const inserted = await db
    .insert(prescriptions)
    .values({
      patientId: patient?.id ?? null,
      sessionId,
      fileName: file.name,
      imagePath: `/uploads/${safeName}`,
      status: "review",
      ...extracted,
    })
    .returning();

  return Response.json(inserted[0]);
}
