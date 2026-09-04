import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { drugInteractions, products } from "@/db/schema";

export type InteractionHit = {
  severity: string;
  description: string;
  recommendation: string;
  left: string;
  right: string;
};

export async function findInteractions(productIds: number[]): Promise<InteractionHit[]> {
  if (productIds.length < 2) return [];
  const unique = [...new Set(productIds)];
  const rows = await db.select().from(drugInteractions);
  const catalog = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(inArray(products.id, unique));
  const names = Object.fromEntries(catalog.map((row) => [row.id, row.name]));

  const hits: InteractionHit[] = [];
  for (const row of rows) {
    if (unique.includes(row.productAId) && unique.includes(row.productBId)) {
      hits.push({
        severity: row.severity,
        description: row.description,
        recommendation: row.recommendation,
        left: names[row.productAId] ?? "Medication A",
        right: names[row.productBId] ?? "Medication B",
      });
    }
  }
  return hits;
}

export function severityRank(severity: string) {
  if (severity === "severe") return 3;
  if (severity === "moderate") return 2;
  return 1;
}
