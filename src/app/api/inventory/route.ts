import { NextResponse } from "next/server";
import notion, { databaseIds, getTextProperty } from "@/lib/notion";
import { mockInventory } from "@/lib/mock-data";
import type { InventoryItem } from "@/lib/types";

const USE_MOCK = !process.env.NOTION_API_KEY || !databaseIds.inventory;

export async function GET() {
  if (USE_MOCK) {
    return NextResponse.json(mockInventory);
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseIds.inventory,
    });

    const items: InventoryItem[] = response.results.map((page) => {
      const p = page as Record<string, unknown>;
      return {
        id: p.id as string,
        name: getTextProperty(p, "이름"),
        quantity: parseInt(getTextProperty(p, "수량")) || 0,
        status: getTextProperty(p, "상태") as InventoryItem["status"],
        location: getTextProperty(p, "보관위치"),
        note: getTextProperty(p, "비고") || undefined,
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json(mockInventory);
  }
}
