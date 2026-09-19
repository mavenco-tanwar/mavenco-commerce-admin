import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getTenantDatabase } from '@/lib/mongodb';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

const INITIAL_SAAS_REVIEWS = [
  {
    id: 'rev_saas_1',
    type: 'saas',
    author: 'Aarav Singhania',
    role: 'Founder & CEO',
    company: 'Vedic Luxe Botanicals',
    location: 'Bengaluru, India',
    rating: 5,
    highlight: 'Saved ₹3.8L in First 6 Months',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    comment: 'Migrating from Shopify Plus to Mavenco was the best decision for our balance sheet. 0% revenue cut, sub-40ms edge speeds, and our mobile conversion jumped from 1.9% to 3.4%.',
    badge: 'D2C Brand Founder',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_saas_2',
    type: 'saas',
    author: 'Elena Rostova',
    role: 'VP of E-Commerce',
    company: 'Nordic Atelier',
    location: 'London & Dubai',
    rating: 5,
    highlight: 'Instant Visual CMS Freedom',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    comment: 'Our marketing team creates high-converting seasonal lookbooks in minutes without touching code or paying for 8 different Shopify plugins. The multi-currency engine works flawlessly across GCC and Europe.',
    badge: 'Enterprise Scale',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_saas_3',
    type: 'saas',
    author: 'Rohan Deshmukh',
    role: 'Co-Founder & CTO',
    company: 'Apex Athletics',
    location: 'Mumbai, India',
    rating: 5,
    highlight: 'Handled 14,000 Concurrent Drops',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    comment: 'During our festive drop, the flash sale surge mode handled 14k concurrent checkouts on Next.js 16 Edge without a single glitch or timeout. Complete database isolation gives us peace of mind.',
    badge: 'High-Volume D2C',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_saas_4',
    type: 'saas',
    author: 'Meera Nambiar',
    role: 'Creative Director',
    company: 'Samyukta Couture',
    location: 'Delhi NCR',
    rating: 5,
    highlight: 'Bespoke Editorial Aesthetics',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop',
    comment: 'Mavenco gave our luxury brand the couture digital storefront it deserved. The typography, smooth page transitions, and WhatsApp order flow provide a true VIP white-glove experience.',
    badge: 'Luxury Brand Director',
    status: 'published',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_PRODUCT_REVIEWS = [
  {
    id: 'rev_prod_1',
    type: 'product',
    tenantSlug: 'muskan-clothing',
    storeSlug: 'muskan-clothing',
    store: 'Muskan Clothing',
    product: 'Pure Mulberry Silk Banarasi Saree',
    productTitle: 'Pure Mulberry Silk Banarasi Saree',
    productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    location: 'Mumbai, India',
    rating: 5,
    comment: 'The saree drape and antique zari craftsmanship are out of this world! Checkout was under 3 seconds on mobile.',
    reviewText: 'The saree drape and antique zari craftsmanship are out of this world! Checkout was under 3 seconds on mobile.',
    badge: 'Verified Buyer',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_prod_2',
    type: 'product',
    tenantSlug: 'muskan-clothing',
    storeSlug: 'muskan-clothing',
    store: 'Muskan Clothing',
    product: 'Artisanal Embroidered Velvet Blazer',
    productTitle: 'Artisanal Embroidered Velvet Blazer',
    productImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
    customerName: 'Kavita Mehta',
    customerEmail: 'kavita.mehta@example.com',
    location: 'Delhi NCR',
    rating: 5,
    comment: 'Super fast delivery and flawless fit. The velvet has a rich luster that received endless compliments at the wedding.',
    reviewText: 'Super fast delivery and flawless fit. The velvet has a rich luster that received endless compliments at the wedding.',
    badge: 'Verified Buyer',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_prod_3',
    type: 'product',
    tenantSlug: 'auraliving',
    storeSlug: 'auraliving',
    store: 'Aura Living',
    product: 'Handcrafted Fluted Ceramic Vase',
    productTitle: 'Handcrafted Fluted Ceramic Vase',
    productImage: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=800&auto=format&fit=crop',
    customerName: 'Astrid Lindqvist',
    customerEmail: 'astrid.l@example.com',
    location: 'Stockholm, Sweden',
    rating: 5,
    comment: 'The matte chalk texture is so soothing. Packaged with zero plastic and arrived in pristine condition.',
    reviewText: 'The matte chalk texture is so soothing. Packaged with zero plastic and arrived in pristine condition.',
    badge: 'Verified Buyer',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rev_prod_4',
    type: 'product',
    tenantSlug: 'apexathletics',
    storeSlug: 'apexathletics',
    store: 'Apex Athletics',
    product: 'Apex Pro Seamless High-Waist Leggings',
    productTitle: 'Apex Pro Seamless High-Waist Leggings',
    productImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    customerName: 'Vikram Rajput',
    customerEmail: 'vikram.r@example.com',
    location: 'Bengaluru, India',
    rating: 5,
    comment: '100% squat proof and holds shape after 20+ intense training washes. Best activewear brand in India right now.',
    reviewText: '100% squat proof and holds shape after 20+ intense training washes. Best activewear brand in India right now.',
    badge: 'Verified Athlete',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'saas';
  const storeSlug = (searchParams.get('store') || searchParams.get('tenant') || '').toLowerCase().trim();
  const status = searchParams.get('status') || 'all';
  const cleanSlug = (storeSlug || request.headers.get('x-tenant-slug') || '').replace(/^store_/, '').toLowerCase().trim();

  try {
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (db) {
      if (type === 'saas') {
        const collection = db.collection('saas_reviews');
        const count = await collection.countDocuments();
        if (count === 0) {
          await collection.insertMany(INITIAL_SAAS_REVIEWS);
        }

        const query: Record<string, any> = {};
        if (status !== 'all') {
          query.status = status;
        }

        const reviews = await collection.find(query).sort({ createdAt: -1 }).toArray();
        const clean = reviews.map(({ _id, ...rest }) => rest);
        return NextResponse.json({ data: clean, count: clean.length, source: 'mongodb_atlas' }, { headers: corsHeaders() });
      } else {
        const collection = db.collection('product_reviews');
        const count = await collection.countDocuments();
        if (count === 0) {
          await collection.insertMany(INITIAL_PRODUCT_REVIEWS);
        }

        const query: Record<string, any> = {};
        if (status !== 'all') {
          query.status = status;
        }
        if (storeSlug) {
          query.$or = [{ storeSlug }, { tenantSlug: storeSlug }, { store: { $regex: storeSlug, $options: 'i' } }];
        }

        const reviews = await collection.find(query).sort({ createdAt: -1 }).toArray();
        const clean = reviews.map(({ _id, ...rest }) => rest);
        return NextResponse.json({ data: clean, count: clean.length, source: 'mongodb_atlas' }, { headers: corsHeaders() });
      }
    }
  } catch (err) {
    console.error('MongoDB admin reviews fetch error:', err);
  }

  const fallback = type === 'saas' ? INITIAL_SAAS_REVIEWS : INITIAL_PRODUCT_REVIEWS;
  return NextResponse.json({ data: fallback, count: fallback.length, source: 'fallback' }, { headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type || 'saas';
    const { searchParams } = new URL(request.url);
    const cleanSlug = (body.storeSlug || body.tenantSlug || searchParams.get('tenant') || request.headers.get('x-tenant-slug') || '').replace(/^store_/, '').toLowerCase().trim();
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500, headers: corsHeaders() });
    }

    const collectionName = type === 'saas' ? 'saas_reviews' : 'product_reviews';
    const doc = {
      ...body,
      id: body.id || `rev_${type}_${Date.now()}`,
      status: body.status || (type === 'saas' ? 'published' : 'approved'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection(collectionName).insertOne(doc);

    return NextResponse.json({ success: true, data: doc, source: 'mongodb_atlas' }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type || 'saas';
    const { searchParams } = new URL(request.url);
    const cleanSlug = (body.storeSlug || body.tenantSlug || searchParams.get('tenant') || request.headers.get('x-tenant-slug') || '').replace(/^store_/, '').toLowerCase().trim();
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (!db || !body.id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400, headers: corsHeaders() });
    }

    const collectionName = type === 'saas' ? 'saas_reviews' : 'product_reviews';
    const { id, _id, ...updates } = body;
    const result = await db.collection(collectionName).updateOne(
      { id },
      {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || (id?.includes('saas') ? 'saas' : 'product');
    const cleanSlug = (searchParams.get('tenant') || searchParams.get('store') || request.headers.get('x-tenant-slug') || '').replace(/^store_/, '').toLowerCase().trim();
    const db = cleanSlug ? ((await getTenantDatabase(cleanSlug)) || (await getDatabase())) : (await getDatabase());
    if (!db || !id) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400, headers: corsHeaders() });
    }

    const collectionName = type === 'saas' ? 'saas_reviews' : 'product_reviews';
    const result = await db.collection(collectionName).deleteOne({ id });
    return NextResponse.json({ success: true, deletedCount: result.deletedCount }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
