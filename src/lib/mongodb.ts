import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || '';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return !!uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const currentUri = process.env.MONGODB_URI || process.env.MONGO_URI || uri;
  if (!currentUri || (!currentUri.startsWith('mongodb://') && !currentUri.startsWith('mongodb+srv://'))) {
    return null;
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        const devClient = new MongoClient(currentUri, { serverSelectionTimeoutMS: 10000 });
        global._mongoClientPromise = devClient.connect().catch((err) => {
          global._mongoClientPromise = undefined;
          throw err;
        });
      }
      return await global._mongoClientPromise;
    } else {
      if (!clientPromise) {
        const prodClient = new MongoClient(currentUri, { serverSelectionTimeoutMS: 10000 });
        clientPromise = prodClient.connect().catch((err) => {
          clientPromise = null;
          throw err;
        });
      }
      return await clientPromise;
    }
  } catch (err) {
    console.error('MongoDB connection error in admin:', err);
    return null;
  }
}

export async function getDatabase(dbName: string = 'mavenco_platform'): Promise<Db | null> {
  try {
    const mongoClient = await getMongoClient();
    if (!mongoClient) return null;
    return mongoClient.db(dbName);
  } catch (err) {
    console.error('getDatabase error in admin:', err);
    return null;
  }
}

/**
 * Returns the platform-level database (mavenco_platform).
 * Use for: tenant registry, users, platform_tenants_registry, broadcasts, roadmap, etc.
 */
export async function getPlatformDatabase(): Promise<Db | null> {
  return getDatabase("mavenco_platform");
}

/**
 * Returns the tenant-scoped database (tenant_<slug>).
 * ALL tenant business data (products, orders, customers, collections, themes, cms, settings, etc.)
 * must be read/written through this function.
 */
export async function getTenantDatabase(tenantSlug?: string): Promise<Db | null> {
  if (!tenantSlug) {
    console.warn("[getTenantDatabase] No tenant slug provided");
    return null;
  }
  const safeTenantId = tenantSlug
    .replace(/^store_/, "")
    .replace(/^tenant_/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase();
  if (!safeTenantId || safeTenantId === "all") {
    console.warn("[getTenantDatabase] Invalid tenant slug after sanitization:", tenantSlug);
    return null;
  }
  const dbName = `tenant_${safeTenantId}`;
  return getDatabase(dbName);
}
