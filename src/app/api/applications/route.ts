import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/api-auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createApplication } from "@/lib/data";
import { FORMS_CATALOG, type FormCategory } from "@/lib/forms-catalog";
import type { ApplicationType } from "@/lib/types";

/**
 * 양식 카테고리 → 서류 유형 매핑.
 * Notion 의 "유형" select 는 (예산/동아리등록/물품사용/기타) 4 종만 허용한다.
 */
function categoryToApplicationType(category: FormCategory): ApplicationType {
  switch (category) {
    case "예산안":
    case "결산":
      return "예산";
    case "동아리 등록":
    case "초과 등록":
      return "동아리등록";
    default:
      return "기타";
  }
}

const VALID_TYPES: ApplicationType[] = ["예산", "동아리등록", "물품사용", "기타"];

export async function POST(request: NextRequest) {
  const g = guard(request);
  if (!g.ok) return g.response;
  const user = g.user;

  // 사용자당 분당 5건의 슬라이딩 윈도우 제한.
  const limit = checkRateLimit(`applications:create:${user.id}`, 5);
  if (!limit.success) return rateLimitResponse(limit.resetMs);

  let body: {
    formTemplateId?: string;
    title?: string;
    type?: ApplicationType;
    clubName?: string;
    attachments?: string[];
    note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }

  const attachments = Array.isArray(body.attachments) ? body.attachments.filter((u) => typeof u === "string") : [];
  if (attachments.length === 0) {
    return NextResponse.json({ error: "첨부파일을 1개 이상 업로드해주세요." }, { status: 400 });
  }

  // 양식 카탈로그에서 기본값 유추
  const template = body.formTemplateId
    ? FORMS_CATALOG.find((f) => f.id === body.formTemplateId)
    : undefined;

  const title = (body.title?.trim() || template?.displayName || "서류 신청").slice(0, 200);
  const clubName = (body.clubName?.trim() || user.clubName || "").slice(0, 100);
  if (!clubName) {
    return NextResponse.json({ error: "동아리명을 입력해주세요." }, { status: 400 });
  }

  let type: ApplicationType = "기타";
  if (body.type && VALID_TYPES.includes(body.type)) {
    type = body.type;
  } else if (template) {
    type = categoryToApplicationType(template.category);
  }

  try {
    const application = await createApplication(
      {
        title,
        type,
        clubName,
        attachments,
        formTemplateId: body.formTemplateId,
        note: body.note?.slice(0, 1000),
      },
      user,
    );
    return NextResponse.json({ application: { id: application.id } }, { status: 201 });
  } catch (error) {
    console.error("Failed to create application:", error);
    return NextResponse.json({ error: "서류 제출에 실패했습니다." }, { status: 500 });
  }
}
