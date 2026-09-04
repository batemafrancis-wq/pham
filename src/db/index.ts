import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { mockDbData } from "./mock-data";

const databaseUrl = process.env.DATABASE_URL;

const resolveColumnName = (value: any): string | null => {
  if (!value || typeof value !== "object") return null;

  if (typeof value.name === "string" && value.name !== "and" && value.name !== "or") {
    return value.name;
  }

  if (value.column && typeof value.column.name === "string") {
    return value.column.name;
  }

  if (Array.isArray(value.queryChunks)) {
    for (const chunk of value.queryChunks) {
      const name = resolveColumnName(chunk);
      if (name) return name;
    }
  }

  if (value.left) {
    const leftName = resolveColumnName(value.left);
    if (leftName) return leftName;
  }

  if (value.right) {
    const rightName = resolveColumnName(value.right);
    if (rightName) return rightName;
  }

  return null;
};

const resolveConditionValue = (value: any): any => {
  if (value == null) return value;

  if (typeof value === "object") {
    if (Object.prototype.hasOwnProperty.call(value, "value")) {
      return value.value;
    }

    if (Object.prototype.hasOwnProperty.call(value, "right")) {
      return resolveConditionValue(value.right);
    }

    if (Object.prototype.hasOwnProperty.call(value, "left")) {
      return resolveConditionValue(value.left);
    }

    if (Array.isArray(value.queryChunks)) {
      for (const chunk of value.queryChunks) {
        const resolved = resolveConditionValue(chunk);
        if (resolved !== undefined && resolved !== null && !(typeof resolved === "object" && "name" in resolved)) {
          return resolved;
        }
      }
    }
  }

  return value;
};

const matchCondition = (row: Record<string, any>, condition: any): boolean => {
  if (!condition) return true;

  if (Array.isArray(condition)) {
    return condition.every((item) => matchCondition(row, item));
  }

  if (typeof condition !== "object") {
    return true;
  }

  if (condition.name === "and" || condition.name === "or") {
    const chunks = Array.isArray(condition.queryChunks) ? condition.queryChunks : [];
    if (condition.name === "and") {
      return chunks.every((chunk) => matchCondition(row, chunk));
    }
    return chunks.some((chunk) => matchCondition(row, chunk));
  }

  if (condition.left && condition.right) {
    const field = resolveColumnName(condition.left);
    return field ? row[field] === resolveConditionValue(condition.right) : true;
  }

  if (Array.isArray(condition.queryChunks)) {
    const column = condition.queryChunks.find((item) => resolveColumnName(item));
    const valueCandidate = condition.queryChunks.find((item) => {
      if (!item || typeof item !== "object") return false;
      return item !== column && resolveConditionValue(item) !== undefined;
    });

    if (column && valueCandidate) {
      const field = resolveColumnName(column);
      return field ? row[field] === resolveConditionValue(valueCandidate) : true;
    }

    return condition.queryChunks.every((chunk) => matchCondition(row, chunk));
  }

  if (condition.column && Object.prototype.hasOwnProperty.call(condition, "value")) {
    const field = resolveColumnName(condition.column);
    return field ? row[field] === condition.value : true;
  }

  return true;
};

const withMockHelpers = <T extends Record<string, any>>(rows: T[]) => {
  const list = [...rows] as T[] & {
    where: (condition: any) => typeof list;
    limit: (count: number) => typeof list;
    orderBy: (column: any) => typeof list;
  };

  list.where = (condition: any) => {
    const filtered = rows.filter((row) => matchCondition(row, condition));
    return withMockHelpers(filtered);
  };

  list.limit = (count: number) => withMockHelpers(rows.slice(0, count));

  list.orderBy = (column: any) => {
    const key = resolveColumnName(column);
    if (!key) return withMockHelpers(rows);

    return withMockHelpers(
      [...rows].sort((left, right) => {
        const a = left[key];
        const b = right[key];
        if (a == null && b == null) return 0;
        if (a == null) return 1;
        if (b == null) return -1;
        return String(a).localeCompare(String(b));
      }),
    );
  };

  return list;
};

const createMockDb = () => {
  const store = new Map<string, any[]>();

  Object.entries(mockDbData).forEach(([key, rows]) => {
    store.set(key, rows.map((row) => ({ ...row })));
  });

  const getRowsForTable = (source: any) => {
    const name = source?.name ?? source;
    const rows = store.get(String(name)) ?? [];
    return withMockHelpers(rows);
  };

  return {
    select: () => ({
      from: (source: any) => getRowsForTable(source),
    }),
    insert: (source: any) => ({
      values: async (rows: any[]) => {
        const name = source?.name ?? source;
        const current = store.get(String(name)) ?? [];
        const next = [...current, ...rows.map((row) => ({ ...row }))];
        store.set(String(name), next);
        return rows;
      },
    }),
    delete: (source: any) => ({
      where: async (condition: any) => {
        const name = source?.name ?? source;
        const current = store.get(String(name)) ?? [];
        const next = current.filter((row) => !matchCondition(row, condition));
        store.set(String(name), next);
      },
    }),
    update: (source: any) => ({
      set: (values: Record<string, unknown>) => ({
        where: async (condition: any) => {
          const name = source?.name ?? source;
          const current = store.get(String(name)) ?? [];
          const next = current.map((row) => (matchCondition(row, condition) ? { ...row, ...values } : row));
          store.set(String(name), next);
        },
      }),
    }),
    execute: async () => undefined,
  };
};

const useMockDb = !databaseUrl;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaMockDb?: ReturnType<typeof createMockDb>;
};

export const pool = useMockDb
  ? undefined
  : (globalForDb.__arenaNextJsPostgresqlPool ?? new Pool({ connectionString: databaseUrl! }));

if (!useMockDb && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

const mockDb = useMockDb ? (globalForDb.__arenaMockDb ??= createMockDb()) : undefined;

export const db = useMockDb ? mockDb : drizzle(pool!, { schema });
