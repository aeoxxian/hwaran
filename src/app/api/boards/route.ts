import { NextRequest, NextResponse } from "next/server";
import notion from "@/lib/notion";
import {
    getBoardPosts,
    getDbIdForCategory,
    getBoardContentProp,
} from "@/lib/data";
import { mockBoardPosts } from "@/lib/mock-data";
import type { BoardPost } from "@/lib/types";
import { guard } from "@/lib/api-auth";

type BoardCategory = BoardPost["category"];

const VALID_CATEGORIES: BoardCategory[] = [
    "qna",
    "complaints",
    "lost-found",
    "promotions",
];
const USE_MOCK = !process.env.NOTION_API_KEY;

function isBoardCategory(value: string | null): value is BoardCategory {
    return !!value && VALID_CATEGORIES.includes(value as BoardCategory);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const category: BoardCategory = isBoardCategory(categoryParam)
        ? categoryParam
        : "qna";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Math.min(
        Number(searchParams.get("pageSize") || "20"),
        100,
    );

    const { posts, total } = await getBoardPosts(category, {
        search,
        status,
        page,
        pageSize,
    });
    return NextResponse.json({ posts, total, page, pageSize });
}

export async function POST(request: NextRequest) {
    const g = guard(request);
    if (!g.ok) return g.response;
    const user = g.user;

    const body = await request.json();
    const category = body.category as BoardCategory;
    if (!category || !VALID_CATEGORIES.includes(category)) {
        return NextResponse.json(
            { error: "유효하지 않은 카테고리입니다." },
            { status: 400 },
        );
    }

    if (!body.title || !body.content) {
        return NextResponse.json(
            { error: "제목과 내용을 입력해주세요." },
            { status: 400 },
        );
    }

    const isAnonymous = Boolean(body.isAnonymous);
    const authorName = isAnonymous ? "익명" : user.name;
    const authorId = user.id;
    const today = new Date().toISOString().split("T")[0];

    // 카테고리별 초기 상태값
    const initialStatus =
        category === "lost-found"
            ? "미해결"
            : category === "promotions"
              ? "대기"
              : "대기";
    const initialApproval: BoardPost["approvalStatus"] =
        category === "promotions" ? "pending" : "approved";

    if (USE_MOCK || !getDbIdForCategory(category)) {
        const newPost: BoardPost = {
            id: `post-${Date.now()}`,
            title: body.title,
            content: body.content,
            authorId,
            author: authorName,
            createdAt: today,
            updatedAt: today,
            category,
            status: initialStatus,
            isAnonymous,
            clubId: body.clubId || undefined,
            clubName: body.clubName || undefined,
            location: body.location || undefined,
            attachments: body.attachments || [],
            images: body.images || [],
            approvalStatus: initialApproval,
            visibility: body.visibility === "internal" ? "internal" : "public",
        };
        mockBoardPosts.unshift(newPost);
        return NextResponse.json({ post: newPost }, { status: 201 });
    }

    try {
        const contentProp = getBoardContentProp(category);
        const content: string = (body.content as string).slice(0, 2000);

        // 모든 게시판 DB에 공통으로 존재하는 속성.
        // (setup-notion-dbs.ts 스키마와 정확히 1:1 대응)
        const properties: Record<string, unknown> = {
            제목: { title: [{ text: { content: body.title } }] },
            [contentProp]: { rich_text: [{ text: { content } }] },
            작성자: { rich_text: [{ text: { content: authorName } }] },
            작성자ID: { rich_text: [{ text: { content: authorId } }] },
            작성일: { date: { start: today } },
            수정일: { date: { start: today } },
            상태: { select: { name: initialStatus } },
            승인상태: { select: { name: initialApproval } },
            공개범위: {
                select: {
                    name:
                        body.visibility === "internal" ? "internal" : "public",
                },
            },
        };

        if (category === "qna" || category === "complaints") {
            properties["익명여부"] = { checkbox: isAnonymous };
        }
        if (category === "lost-found") {
            properties["장소"] = {
                rich_text: [{ text: { content: body.location || "" } }],
            };
        }
        if (category === "promotions") {
            properties["동아리ID"] = {
                rich_text: [{ text: { content: body.clubId || "" } }],
            };
            properties["동아리명"] = {
                rich_text: [{ text: { content: body.clubName || "" } }],
            };
        }

        if (Array.isArray(body.attachments) && body.attachments.length > 0) {
            properties["첨부파일"] = {
                files: body.attachments.map((token: string, index: number) => {
                    const isExternalUrl = /^https?:\/\//i.test(token);
                    if (isExternalUrl) {
                        return {
                            name: `첨부파일-${index + 1}`,
                            type: "external" as const,
                            external: { url: token },
                        };
                    }
                    return {
                        name: `첨부파일-${index + 1}`,
                        type: "file_upload" as const,
                        file_upload: { id: token },
                    };
                }),
            };
        }

        if (Array.isArray(body.images) && body.images.length > 0) {
            properties["이미지"] = {
                files: body.images.map((url: string, index: number) => ({
                    name: `이미지-${index + 1}`,
                    type: "external",
                    external: { url },
                })),
            };
        }

        const response = await notion.pages.create({
            parent: { database_id: getDbIdForCategory(category) },
            properties: properties as Parameters<
                typeof notion.pages.create
            >[0]["properties"],
        });

        return NextResponse.json(
            { post: { id: response.id }, id: response.id },
            { status: 201 },
        );
    } catch (error) {
        console.error("Failed to create board post:", error);
        return NextResponse.json(
            { error: "게시글 작성에 실패했습니다." },
            { status: 500 },
        );
    }
}
