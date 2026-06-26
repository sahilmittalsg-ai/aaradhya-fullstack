import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let connected = false;

export type SortOrder = 1 | -1 | "asc" | "desc" | "ascending" | "descending";

export function getPool() {
  if (!pool || !connected) {
    throw new Error("PostgreSQL is not connected");
  }

  return pool;
}

export function isDbConnected() {
  return connected;
}

export async function connectDb(uri = process.env.DATABASE_URL || process.env.POSTGRES_URL || "") {
  if (!uri) {
    throw new Error("DATABASE_URL is required");
  }

  pool = new Pool({
    connectionString: uri,
    ssl: uri.includes("render.com") ? { rejectUnauthorized: false } : undefined
  });

  const client = await pool.connect();
  try {
    await client.query("select 1");
    await client.query(`
      create table if not exists app_documents (
        collection text not null,
        id text not null,
        data jsonb not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        primary key (collection, id)
      )
    `);
    await client.query("create index if not exists app_documents_collection_idx on app_documents (collection)");
    await client.query("create index if not exists app_documents_data_gin_idx on app_documents using gin (data)");
    connected = true;
    console.log("PostgreSQL connected");
  } finally {
    client.release();
  }
}

export async function disconnectDb() {
  connected = false;
  await pool?.end();
  pool = null;
}
