import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { FORMS_CATALOG, type FormFileType } from "@/lib/forms-catalog";

/**
 * GET /api/forms/[id]/download
 *
 * 정적 파일을 직접 노출하지 않고, catalog의 id 기반으로 서버가 안전하게
 * 디스크 파일을 읽어 attachment 로 응답한다. 한글 파일명은 RFC 5987 형식의
 * filename*=UTF-8'' 인코딩으로 강제하여 모든 브라우저에서 의도된 파일명으로
 * 저장되도록 한다.
 */

const MIME: Record<FormFileType, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = FORMS_CATALOG.find((f) => f.id === id);
  if (!form) {
    return NextResponse.json({ error: "양식을 찾을 수 없습니다." }, { status: 404 });
  }

  // form.downloadUrl 은 "/forms/<dir>/<file>" 형태. public/ 아래의 절대 경로로 변환.
  const relative = form.downloadUrl.replace(/^\//, "");
  const absolute = path.join(process.cwd(), "public", relative);

  let buffer: Buffer;
  try {
    buffer = await fs.readFile(absolute);
  } catch (err) {
    console.error("[forms/download] 파일을 읽지 못했습니다", absolute, err);
    return NextResponse.json(
      { error: "파일을 읽을 수 없습니다." },
      { status: 500 }
    );
  }

  const filename = `${form.displayName}.${form.fileType}`;
  // RFC 5987: filename*=UTF-8''<percent-encoded>
  const encoded = encodeURIComponent(filename);
  // 비-ASCII 클라이언트 fallback 용 ASCII 파일명 (마지막 path segment 사용)
  const asciiFallback = relative.split("/").pop() || `form.${form.fileType}`;

  const body = new Uint8Array(buffer);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": MIME[form.fileType],
      "Content-Length": String(buffer.length),
      "Content-Disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`,
      "Cache-Control": "no-store",
    },
  });
}
