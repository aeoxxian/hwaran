import { NextRequest, NextResponse } from "next/server";
import notion from "@/lib/notion";
import { guard } from "@/lib/api-auth";

/**
 * 클라이언트가 보낸 파일을 Notion File Upload API로 직접 업로드합니다.
 * Notion에 첨부될 파일이므로 노션 페이지/속성에서 바로 다운로드/열람 가능합니다.
 *
 * 응답: { fileUploadId, filename, contentType }
 * 클라이언트는 이 fileUploadId를 attachments 배열에 담아 기안 상신 시 함께 전송합니다.
 */

const MAX_SINGLE_PART_BYTES = 20 * 1024 * 1024;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    const g = guard(request, { minAdminLevel: 1 });
    if (!g.ok) return g.response;

    if (!process.env.NOTION_API_KEY) {
        return NextResponse.json(
            { error: "NOTION_API_KEY가 설정되지 않았습니다." },
            { status: 503 },
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return NextResponse.json(
                { error: "파일이 없습니다." },
                { status: 400 },
            );
        }

        if (file.size > MAX_SINGLE_PART_BYTES) {
            return NextResponse.json(
                { error: "파일 크기는 20MB를 초과할 수 없습니다." },
                { status: 413 },
            );
        }

        const filename = file.name || "file";
        const contentType = file.type || "application/octet-stream";

        const created = await notion.fileUploads.create({
            mode: "single_part",
            filename,
            content_type: contentType,
        });

        const blob = new Blob([await file.arrayBuffer()], {
            type: contentType,
        });

        await notion.fileUploads.send({
            file_upload_id: created.id,
            file: { filename, data: blob },
        });

        return NextResponse.json({
            fileUploadId: created.id,
            filename,
            contentType,
        });
    } catch (e) {
        console.error("notion-upload failed:", e);
        const message =
            e instanceof Error ? e.message : "노션 파일 업로드 실패";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
