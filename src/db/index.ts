import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { mockDbData } from "./mock-data";

const databaseUrl = process.env.DATABASE_URL;

const createMockDb = () => {
  const store = new Map<string, unknown[]>();

  const data = mockDbData as Record<string, any[]>;
  Object.entries(data).forEach(([key, rows]) => {
    store.set(key, rows.map((row) => ({ ...row })));
  });

  const table = <T extends { [key: string]: any }>(name: string) => ({
    select: () => ({
      from: (source: any) => ({
        limit: async (count: number) => {
          const rows = store.get(name) ?? [];
          return rows.slice(0, count) as T[];
        },
        where: (condition: any) => ({
          limit: async (count: number) => {
            const rows = store.get(name) ?? [];
            const filtered = rows.filter((row) => {
              if (!condition) return true;
              const [field, value] = Object.entries(condition ?? {})[0] ?? [];
              return field ? row[field] === value : true;
            });
            return filtered.slice(0, count) as T[];
          },
        }),
      }),
    }),
    insert: () => ({
      values: async () => undefined,
    }),
    delete: () => ({
      where: async () => undefined,
    }),
    update: () => ({
      set: () => ({
        where: async () => undefined,
      }),
    }),
    orderBy: () => ({
      limit: async (count: number) => {
        const rows = store.get(name) ?? [];
        return rows.slice(0, count) as T[];
      },
    }),
  });

  const dbLike = {
    select: () => ({
      from: (source: any) => ({
        limit: async (count: number) => {
          const rows = store.get(source?.name ?? "") ?? [];
          return rows.slice(0, count);
        },
        where: (condition: any) => ({
          limit: async (count: number) => {
            const rows = store.get(source?.name ?? "") ?? [];
            return rows.filter((row) => {
              const [field, value] = Object.entries(condition ?? {})[0] ?? [];
              return field ? row[field] === value : true;
            }).slice(0, count);
          },
        }),
      }),
    }),
    insert: (source: any) => ({
      values: async (rows: any[]) => {
        const key = source?.name ?? "";
        const current = store.get(key) ?? [];
        store.set(key, [...current, ...rows]);
        return rows;
      },
    }),
    delete: (source: any) => ({
      where: async (condition: any) => {
        const key = source?.name ?? "";
        const current = store.get(key) ?? [];
        const next = current.filter((row) => {
          const [field, value] = Object.entries(condition ?? {})[0] ?? [];
          return field ? row[field] !== value : true;
        });
        store.set(key, next);
      },
    }),
    update: (source: any) => ({
      set: (values: Record<string, unknown>) => ({
        where: async (condition: any) => {
          const key = source?.name ?? "";
          const current = store.get(key) ?? [];
          const next = current.map((row) => {
            const [field, value] = Object.entries(condition ?? {})[0] ?? [];
            if (field && row[field] === value) {
              return { ...row, ...values };
            }
            return row;
          });
          store.set(key, next);
        },
      }),
    }),
    execute: async () => undefined,
  } as any;

  return dbLike;
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
