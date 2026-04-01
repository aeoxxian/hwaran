import { NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty, getFilesProperty } from "@/lib/notion";
import { mockDocuments } from "@/lib/mock-data";
import type { Document } from "@/lib/types";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.documents;

export async function GET() {
  if (USE_MOCK) {
    return NextResponse.json(mockDocuments);
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseIds.documents,
      sorts: [{ property: "작성일", direction: "descending" }],
    });

    const documents: Document[] = response.results.map((page) => {
      const p = page as Record<string, unknown>;
      return {
        id: p.id as string,
        title: getTextProperty(p, "제목"),
        category: getTextProperty(p, "분류") as Document["category"],
        fileUrl: getFilesProperty(p, "파일")[0] || "#",
        createdAt: getTextProperty(p, "작성일"),
      };
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(mockDocuments);
  }
}
