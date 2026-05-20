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

const ALLOWED_FOLDERS = new Set([
  "drafts",
  "documents",
  "gallery",
  "clubs",
  "events",
  "inventory",
  "orgchart",
  "notices",
]);

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9가-힣._-]/g, "_").slice(0, 200);
}

export async function POST(request: NextRequest) {
  const g = guard(request, { minAdminLevel: 1 });
  if (!g.ok) return g.response;

  const { filename, contentType, folder } = await request.json();
  const bucket = process.env.AWS_S3_BUCKET;

  if (!bucket || !process.env.AWS_ACCESS_KEY_ID) {
    return NextResponse.json(
      { error: "S3 환경 변수가 설정되지 않았습니다. .env.local을 확인하세요." },
      { status: 503 }
    );
  }

  const safeFolder = typeof folder === "string" && ALLOWED_FOLDERS.has(folder) ? folder : "drafts";
  const safeName = sanitizeFilename(typeof filename === "string" ? filename : "file");
  const key = `${safeFolder}/${Date.now()}-${safeName}`;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return NextResponse.json({ uploadUrl, fileUrl, key });
}
