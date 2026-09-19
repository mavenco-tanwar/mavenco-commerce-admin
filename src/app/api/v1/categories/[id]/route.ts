import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getTenantDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug, x-user-name, X-Store-ID, X-API-Key, X-Tenant-Slug, x-store-id, x-api-key, *',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id;
    const id = decodeURIComponent(rawId || '').trim();
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const tenantParam = body.tenantSlug || searchParams.get('tenant') || req.headers.get('x-tenant-slug') || '';
    const cleanSlug = tenantParam.replace(/^(store_|_)/, '').toLowerCase().trim();
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (db) {
      const { _id, createdAt, ...updates } = body;
      await db.collection('categories').updateOne(
        { $or: [{ id }, { slug: id }] },
        { $set: { ...updates, updatedAt: new Date().toISOString() } }
      );
    }
    return NextResponse.json({ success: true, message: 'Category updated in MongoDB' }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const rawId = resolvedParams?.id;
    const id = decodeURIComponent(rawId || '').trim();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400, headers: corsHeaders() });
    }

    const db = await getDatabase();
    if (db) {
      const { ObjectId } = await import('mongodb');
      let objId = null;
      try {
        if (ObjectId.isValid(id) && id.length === 24) objId = new ObjectId(id);
      } catch {}

      const idMatches: any[] = [
        { id },
        { slug: id },
        ...(objId ? [{ _id: objId }] : []),
      ];

      // 1. Locate category to inspect parentId / children
      const targetCat = await db.collection('categories').findOne({
        $or: idMatches,
      });

      if (targetCat) {
        const targetId = targetCat.id || id;
        const targetSlug = targetCat.slug;

        if (targetCat.parentId) {
          // Subcategory
          await db.collection('categories').deleteMany({
            $or: [
              { id: targetId },
              ...(targetCat._id ? [{ _id: targetCat._id }] : []),
            ],
          });
        } else {
          // Primary department
          await db.collection('categories').deleteMany({
            $or: [
              { id: targetId },
              { parentId: targetId },
              ...(targetSlug ? [{ parentId: targetSlug }] : []),
              ...(targetCat._id ? [{ _id: targetCat._id }] : []),
            ],
          });
        }
      } else {
        await db.collection('categories').deleteMany({
          $or: [
            ...idMatches,
            { parentId: id },
          ],
        });
      }

      // 2. Automatically unassign deleted category from any products in the database
      const deletedIdentifiers = [
        id,
        targetCat?.id,
        targetCat?.slug,
        targetCat?._id?.toString(),
        `cat_${id}`,
      ].filter(Boolean);

      await db.collection('products').updateMany(
        {
          $or: [
            { categoryIds: { $in: deletedIdentifiers } },
            { categoryId: { $in: deletedIdentifiers } },
            { department: { $in: deletedIdentifiers } },
            { category: { $in: deletedIdentifiers } },
            { categorySlug: { $in: deletedIdentifiers } },
          ],
        },
        {
          $pull: { categoryIds: { $in: deletedIdentifiers } } as any,
          $set: {
            category: null,
            categoryName: null,
            categorySlug: null,
            department: null,
            categoryId: null,
          },
        }
      );
    }
    return NextResponse.json({ success: true, message: 'Category deleted from MongoDB and unassigned from products' }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
