import { NextRequest, NextResponse } from "next/server";
import { getDocuments, createDocument } from "@/lib/data";
import { guard } from "@/lib/api-auth";

export async function GET() {
  const documents = await getDocuments();
  return NextResponse.json(documents);
}

export async function POST(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  try {
    const body = await request.json();
    const { title, category, fileUrl } = body;

    if (!title || !category || !fileUrl) {
      return NextResponse.json({ error: "제목/분류/파일은 필수입니다." }, { status: 400 });
    }

    const doc = await createDocument({ title, category, fileUrl });
    return NextResponse.json(doc, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "자료 등록에 실패했습니다." }, { status: 500 });
  }
}
