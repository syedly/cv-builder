import mongoose from 'mongoose';
import { Resolver } from 'node:dns/promises';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Resolve an mongodb+srv:// URI to an explicit mongodb:// URI using public DNS.
// This bypasses the system DNS that blocks SRV queries — the MongoDB driver
// never sees an SRV URI, so it never issues its own querySrv call.
async function resolveSRV(uri: string): Promise<string> {
  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

  const url = new URL(uri.replace('mongodb+srv://', 'https://'));
  const host = url.hostname;
  const userInfo = `${url.username}:${encodeURIComponent(decodeURIComponent(url.password))}`;
  const db = url.pathname.slice(1) || 'test';

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${host}`),
    resolver.resolveTxt(host).catch(() => [] as string[][]),
  ]);

  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');

  const txtFlat = txtRecords.flat().join('&');
  const rsMatch = txtFlat.match(/replicaSet=([^&]+)/);
  const authMatch = txtFlat.match(/authSource=([^&]+)/);

  const params = new URLSearchParams({
    tls: 'true',
    authSource: authMatch ? authMatch[1] : 'admin',
    retryWrites: 'true',
    w: 'majority',
    ...(rsMatch ? { replicaSet: rsMatch[1] } : {}),
  });

  return `mongodb://${userInfo}@${hosts}/${db}?${params}`;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache;
}

global.mongooseCache = global.mongooseCache || { conn: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache.promise) {
    const uri = MONGODB_URI.startsWith('mongodb+srv://')
      ? await resolveSRV(MONGODB_URI)
      : MONGODB_URI;

    global.mongooseCache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        family: 4,
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      })
      .then((m) => {
        console.log('✓ MongoDB connected:', m.connection.host);
        return m;
      })
      .catch((err) => {
        global.mongooseCache.promise = null;
        throw err;
      });
  }

  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}
