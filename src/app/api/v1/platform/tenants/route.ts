import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getMongoClient } from '@/lib/mongodb';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug, X-Tenant-Slug, x-tenant, x-store-id',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  try {
    const db = await getDatabase();
    const mongoClient = await getMongoClient();

    if (db) {
      const [tDocs, rDocs] = await Promise.all([
        db.collection('tenants').find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).toArray(),
        db.collection('platform_tenants_registry').find({ status: { $ne: 'deleted' } }).sort({ createdAt: -1 }).toArray(),
      ]);

      const mergedMap = new Map<string, any>();
      for (const t of [...rDocs, ...tDocs]) {
        const slug = (t.slug || t.id || '').toLowerCase().trim().replace(/^store_/, '');
        if (slug && !mergedMap.has(slug)) {
          const { _id, ...clean } = t;
          mergedMap.set(slug, {
            ...clean,
            slug,
            id: clean.id || `store_${slug}`,
            databaseName: clean.databaseName || `tenant_${slug}`,
          });
        }
      }

      // Discover databases directly from MongoDB cluster
      if (mongoClient) {
        try {
          const dbsList = await mongoClient.db().admin().listDatabases();
          for (const dbInfo of dbsList.databases || []) {
            if (dbInfo.name.startsWith('tenant_')) {
              const slug = dbInfo.name.replace(/^tenant_/, '').toLowerCase().trim();
              if (slug && !mergedMap.has(slug)) {
                mergedMap.set(slug, {
                  id: `store_${slug}`,
                  slug,
                  name: slug
                    .split(/[-_]/)
                    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' '),
                  status: 'active',
                  planId: 'plan_pro',
                  planName: 'Professional',
                  databaseName: dbInfo.name,
                  currency: 'USD',
                  ownerEmail: `admin@${slug}.com`,
                  ownerName: 'Store Administrator',
                  primaryDomain: `${slug}.mavenco.cloud`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
            }
          }
        } catch (listErr) {
          console.warn('[Admin GET tenants] DB discovery warning:', listErr);
        }
      }

      const clean = Array.from(mergedMap.values());
      return NextResponse.json({ data: clean, count: clean.length, source: 'mongodb' }, { headers: corsHeaders() });
    }
  } catch (err) {
    console.error('Failed to load tenants from MongoDB:', err);
  }

  return NextResponse.json({ data: [], source: 'empty' }, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    if (db && body.slug) {
      const cleanSlug = body.slug.toLowerCase().trim();
      const tempPassword = body.temporaryPassword || body.password || `Mavenco@2026!${cleanSlug}`;
      const ownerEmail = body.ownerEmail ? body.ownerEmail.toLowerCase().trim() : null;
      const now = new Date().toISOString();

      const tenantRecord: any = {
        ...body,
        slug: cleanSlug,
        ownerEmail: ownerEmail || body.ownerEmail,
        temporaryPassword: tempPassword,
        password: tempPassword,
        isTemporaryPassword: body.isTemporaryPassword !== undefined ? body.isTemporaryPassword : true,
        passwordUpdatedAt: now,
        updatedAt: now,
      };

      const createdAtVal = tenantRecord.createdAt || now;
      delete tenantRecord.createdAt;
      delete tenantRecord._id;

      const filter = { $or: [{ slug: cleanSlug }, { id: body.id || `store_${cleanSlug}` }] };

      // 1. Upsert Tenant Record in both 'tenants' and 'platform_tenants_registry'
      await Promise.all([
        db.collection('tenants').updateOne(
          filter,
          {
            $set: tenantRecord,
            $setOnInsert: { createdAt: createdAtVal },
          },
          { upsert: true }
        ),
        db.collection('platform_tenants_registry').updateOne(
          filter,
          {
            $set: tenantRecord,
            $setOnInsert: { createdAt: createdAtVal },
          },
          { upsert: true }
        ),
      ]);

      // 2. Upsert Merchant Administrator Account in 'users' collection
      if (ownerEmail) {
        await db.collection('users').updateOne(
          { email: ownerEmail },
          {
            $set: {
              email: ownerEmail,
              name: body.ownerName || body.name || 'Store Owner',
              firstName: body.ownerName ? body.ownerName.split(' ')[0] : body.name || 'Store',
              lastName: body.ownerName ? body.ownerName.split(' ').slice(1).join(' ') || 'Owner' : 'Owner',
              roleId: 'role_owner',
              role: 'owner',
              roleName: 'Store Owner & Administrator',
              tenantId: body.id || `store_${cleanSlug}`,
              tenantSlug: cleanSlug,
              temporaryPassword: tempPassword,
              password: tempPassword,
              isTemporaryPassword: tenantRecord.isTemporaryPassword,
              status: body.status || 'active',
              passwordUpdatedAt: now,
              updatedAt: now,
            },
            $setOnInsert: {
              id: `user_${ownerEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
              createdAt: now,
            },
          },
          { upsert: true }
        );
      }

      // 3. Record activity in MongoDB
      await db.collection('platform_activities').insertOne({
        event: `Superadmin provisioned new store: ${body.name || cleanSlug} (Admin: ${ownerEmail || 'Pending'})`,
        actor: 'superadmin@platform.com',
        tenantId: body.id || `store_${cleanSlug}`,
        tenantName: body.name || cleanSlug,
        severity: 'info',
        ipAddress: '127.0.0.1',
        createdAt: now,
      });
    }

    return NextResponse.json({ success: true, message: 'Tenant and administrator account persisted in database' }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400, headers: corsHeaders() });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, slug, ...updates } = body;
    const identifier = (slug || id || '').toLowerCase().trim();
    const safeSlug = identifier.replace(/^store_/, '');
    const now = new Date().toISOString();

    const db = await getDatabase();
    if (db && identifier) {
      const filter = {
        $or: [
          { slug: identifier },
          { id: identifier },
          { slug: safeSlug },
          { id: `store_${safeSlug}` },
        ],
      };

      const setUpdates: any = {
        ...updates,
        updatedAt: now,
      };

      if (updates.password || updates.temporaryPassword) {
        const pass = updates.password || updates.temporaryPassword;
        setUpdates.password = pass;
        setUpdates.temporaryPassword = pass;
        setUpdates.isTemporaryPassword = updates.isTemporaryPassword !== undefined ? updates.isTemporaryPassword : false;
        setUpdates.passwordUpdatedAt = now;
      }

      await Promise.all([
        db.collection('tenants').updateMany(filter, { $set: setUpdates }),
        db.collection('platform_tenants_registry').updateMany(filter, { $set: setUpdates }),
      ]);

      // If password or owner details updated, sync users collection
      const cleanEmail = (updates.ownerEmail || updates.email || '').toLowerCase().trim();
      if (setUpdates.password || cleanEmail || safeSlug) {
        const userFilter: any[] = [];
        if (cleanEmail) userFilter.push({ email: cleanEmail });
        if (safeSlug) userFilter.push({ tenantSlug: safeSlug });

        if (userFilter.length > 0) {
          const userUpdates: any = { updatedAt: now };
          if (setUpdates.password) {
            userUpdates.password = setUpdates.password;
            userUpdates.temporaryPassword = setUpdates.temporaryPassword;
            userUpdates.isTemporaryPassword = setUpdates.isTemporaryPassword;
            userUpdates.passwordUpdatedAt = now;
          }
          if (updates.ownerName) userUpdates.name = updates.ownerName;
          if (cleanEmail) userUpdates.email = cleanEmail;
          if (safeSlug) userUpdates.tenantSlug = safeSlug;

          await db.collection('users').updateMany({ $or: userFilter }, { $set: userUpdates });
        }
      }

      // Record activity in MongoDB
      if (updates.status) {
        await db.collection('platform_activities').insertOne({
          event: `Store ${identifier} status changed to ${updates.status.toUpperCase()}`,
          actor: 'superadmin@platform.com',
          tenantId: identifier,
          tenantName: identifier,
          severity: updates.status === 'suspended' ? 'warning' : 'info',
          ipAddress: '127.0.0.1',
          createdAt: now,
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Tenant updated in database' }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400, headers: corsHeaders() });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get('all') === 'true';
    let identifier = (
      searchParams.get('tenantId') ||
      searchParams.get('id') ||
      searchParams.get('slug') ||
      searchParams.get('target') ||
      ''
    ).toLowerCase().trim();

    if (!identifier && !deleteAll) {
      try {
        const body = await request.json();
        identifier = (
          body.tenantId ||
          body.id ||
          body.slug ||
          body.target ||
          ''
        ).toLowerCase().trim();
      } catch {}
    }

    if (!identifier && !deleteAll) {
      const qTenant = (searchParams.get('tenant') || '').toLowerCase().trim();
      if (qTenant && qTenant !== 'all' && qTenant !== 'lumina' && !qTenant.startsWith('_')) {
        identifier = qTenant;
      }
    }

    if (!identifier && !deleteAll) {
      return NextResponse.json(
        { success: false, error: 'tenantId, id, or slug is required for deletion' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const db = await getDatabase();
    const mongoClient = await getMongoClient();
    const now = new Date().toISOString();

    if (deleteAll) {
      if (db) {
        await Promise.all([
          db.collection('tenants').deleteMany({}),
          db.collection('platform_tenants_registry').deleteMany({}),
          db.collection('tenant_module_entitlements').deleteMany({}),
          db.collection('tenant_roles').deleteMany({}),
          db.collection('storefronts').deleteMany({}),
          db.collection('storefront_pages').deleteMany({}),
          db.collection('storefront_versions').deleteMany({}),
          db.collection('stores').deleteMany({}),
        ]);
      }
      return NextResponse.json({ success: true, message: 'All tenants purged from database' }, { headers: corsHeaders() });
    }

    const cleanId = identifier.toLowerCase().trim();
    const safeSlug = cleanId.replace(/^store_/, '');

    if (db) {
      const filter = {
        $or: [
          { slug: cleanId },
          { id: cleanId },
          { slug: safeSlug },
          { id: `store_${safeSlug}` },
          { databaseName: `tenant_${safeSlug}` },
          { databaseIdentifier: `tenant_${safeSlug}` },
        ],
      };

      // 1. Permanently delete from platform_tenants_registry and tenants
      await Promise.all([
        db.collection('tenants').deleteMany(filter),
        db.collection('platform_tenants_registry').deleteMany(filter),
      ]);

      // 2. Permanently delete merchant users belonging to this tenant
      await db.collection('users').deleteMany({
        $or: [
          { tenantSlug: cleanId },
          { tenantSlug: safeSlug },
          { tenantId: cleanId },
          { tenantId: safeSlug },
          { tenantId: `store_${safeSlug}` },
        ],
      });

      // 3. Permanently delete governance and configuration documents
      await Promise.allSettled([
        db.collection('tenant_roles').deleteMany({ $or: [{ tenantId: cleanId }, { tenantId: safeSlug }, { tenantId: `store_${safeSlug}` }] }),
        db.collection('tenant_module_entitlements').deleteMany({ $or: [{ tenantId: cleanId }, { tenantId: safeSlug }, { tenantId: `store_${safeSlug}` }] }),
        db.collection('storefronts').deleteMany({ $or: [{ tenantId: cleanId }, { tenantId: safeSlug }, { slug: safeSlug }] }),
        db.collection('storefront_pages').deleteMany({ $or: [{ tenantId: cleanId }, { tenantId: safeSlug }, { tenantSlug: safeSlug }] }),
        db.collection('storefront_versions').deleteMany({ $or: [{ tenantId: cleanId }, { tenantId: safeSlug }, { tenantSlug: safeSlug }] }),
        db.collection('stores').deleteMany({ $or: [{ tenantId: cleanId }, { tenantId: safeSlug }, { slug: safeSlug }, { id: cleanId }] }),
        db.collection('store_domains').deleteMany({ $or: [{ tenantId: cleanId }, { storeSlug: safeSlug }] }),
        db.collection('store_environments').deleteMany({ $or: [{ tenantId: cleanId }, { storeSlug: safeSlug }] }),
      ]);

      // 4. Drop the dedicated tenant database(s) in MongoDB
      if (mongoClient) {
        const dbsToDrop = new Set<string>([
          `tenant_${safeSlug}`,
          `tenant_${safeSlug.replace(/-/g, '_')}`,
          `tenant_${safeSlug.replace(/_/g, '-')}`,
          safeSlug,
        ]);
        for (const dbName of dbsToDrop) {
          try {
            await mongoClient.db(dbName).dropDatabase();
            console.log(`[Admin DELETE] Dropped database: ${dbName}`);
          } catch (dropErr) {
            console.warn(`[Admin DELETE] Drop DB warning for ${dbName}:`, dropErr);
          }
        }
      }

      // 5. Record activity in MongoDB
      await db.collection('platform_activities').insertOne({
        event: `Tenant store ${cleanId} (${safeSlug}) and database tenant_${safeSlug} permanently purged by Superadmin`,
        actor: 'superadmin@platform.com',
        tenantId: `store_${safeSlug}`,
        tenantName: safeSlug,
        severity: 'critical',
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      // 6. Notify storefront API
      const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://mavenco-storefront.vercel.app';
      try {
        fetch(`${storefrontUrl}/api/v1/platform/tenants?tenantId=${encodeURIComponent(safeSlug)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => {});
      } catch {}
    }

    return NextResponse.json({
      success: true,
      tenantId: identifier,
      slug: safeSlug,
      message: `Tenant '${safeSlug}' and dedicated database 'tenant_${safeSlug}' successfully deleted from MongoDB.`,
    }, { headers: corsHeaders() });
  } catch (err: any) {
    console.error('Tenant deletion error:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
