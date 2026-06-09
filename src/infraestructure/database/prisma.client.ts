const { PrismaClient } = require('@prisma/client');

/**
 * When connecting through a pgBouncer/Supabase pooler in session mode,
 * Prisma must not maintain its own connection pool — it should use a single
 * connection and let pgBouncer handle multiplexing. Without this, Prisma
 * opens ~10 connections by default, which instantly saturates a
 * pool_size=15 Supabase session pooler and causes pool-exhaustion errors
 * on concurrent requests.
 */
function buildDatabaseUrl(): string {
    const base = process.env.DATABASE_URL ?? '';
    if (!base) return base;

    if (base.includes('pooler.supabase.com')) {
        const url = new URL(base);
        // 3 connections: enough headroom for concurrent app requests + 1
        // background refresh transaction without exhausting the 15-slot pool.
        if (!url.searchParams.has('connection_limit')) {
            url.searchParams.set('connection_limit', '3');
        }
        if (!url.searchParams.has('pool_timeout')) {
            url.searchParams.set('pool_timeout', '20');
        }
        return url.toString();
    }

    return base;
}

export const prisma = new PrismaClient({
    datasources: {
        db: { url: buildDatabaseUrl() }
    }
});
