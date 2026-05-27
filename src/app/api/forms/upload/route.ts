import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { guard } from "@/lib/api-auth";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * 작성 완료된 서류 양식 파일을 S3 에 업로드하기 위한 presigned URL 발급.
 * 인증된 사용자(레벨 0+) 누구나 사용 가능 — 이후 /api/applications 로 첨부 URL 을 제출한다.
 */
export async function POST(request: NextRequest) {
  const g = guard(request);
  if (!g.ok) return g.response;

  const { filename, contentType } = await request.json();
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket || !process.env.AWS_ACCESS_KEY_ID) {
    return NextResponse.json(
      { error: "S3 환경 변수가 설정되지 않았습니다. 파일 업로드를 건너뜁니다." },
      { status: 503 }
    );
  }

  const safeName = String(filename || "file").replace(/[^\w.\-]/g, "_");
  const key = `applications/${Date.now()}-${safeName}`;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return NextResponse.json({ uploadUrl, fileUrl, key });
}
