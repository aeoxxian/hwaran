import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getUser(request: NextRequest) {
  const token = request.cookies.get("hwaran-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: NextRequest) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { filename, contentType } = await request.json();
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket || !process.env.AWS_ACCESS_KEY_ID) {
    return NextResponse.json(
      { error: "S3 환경 변수가 설정되지 않았습니다. 파일 업로드를 건너뜁니다." },
      { status: 503 }
    );
  }

  const key = `boards/${Date.now()}-${filename}`;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return NextResponse.json({ uploadUrl, fileUrl, key });
}
