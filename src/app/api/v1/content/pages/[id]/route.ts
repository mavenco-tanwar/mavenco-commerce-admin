import { NextRequest, NextResponse } from "next/server";
import {
  GET as pagesGet,
  PUT as pagesPut,
  DELETE as pagesDelete,
} from "../route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Store-ID, X-API-Key, X-Tenant-Slug, x-tenant-slug",
      },
    }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  url.searchParams.set("slug", id);
  const newReq = new NextRequest(url.toString(), {
    headers: request.headers,
    method: "GET",
  });
  return pagesGet(newReq);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any = {};
  try {
    body = await request.json();
  } catch {}
  body.id = body.id || id;
  const url = new URL(request.url);
  const newReq = new NextRequest(url.toString(), {
    headers: request.headers,
    method: "PUT",
    body: JSON.stringify(body),
  });
  return pagesPut(newReq);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  url.searchParams.set("id", id);
  const newReq = new NextRequest(url.toString(), {
    headers: request.headers,
    method: "DELETE",
  });
  return pagesDelete(newReq);
}
