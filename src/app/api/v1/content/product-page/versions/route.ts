import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, x-tenant-slug, X-Tenant-Slug, x-tenant, x-store-id, x-store-slug, X-Store-ID, X-API-Key, *',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenant = (
      searchParams.get('tenant') ||
      searchParams.get('tenantSlug') ||
      req.headers.get('x-tenant-slug') ||
      'lumina'
    )
      .toLowerCase()
      .trim();

    const db = await getDatabase();
    if (db) {
      const versions = await db
        .collection('product_page_versions')
        .find({
          $or: [
            { tenantSlug: tenant },
            { tenantId: tenant },
            { storeSlug: tenant },
            { tenantId: `store_${tenant}` },
          ],
        })
        .sort({ publishedAt: -1 })
        .limit(20)
        .toArray();

      return NextResponse.json(
        {
          success: true,
          data: versions,
        },
        { headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, data: [] },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Failed to fetch PDP versions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
