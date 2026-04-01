import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export default notion;

export const databaseIds = {
  members: process.env.NOTION_MEMBERS_DB || "",
  notices: process.env.NOTION_NOTICES_DB || "",
  clubs: process.env.NOTION_CLUBS_DB || "",
  clubMembers: process.env.NOTION_CLUB_MEMBERS_DB || "",
  events: process.env.NOTION_EVENTS_DB || "",
  qna: process.env.NOTION_QNA_DB || "",
  complaints: process.env.NOTION_COMPLAINTS_DB || "",
  lostFound: process.env.NOTION_LOST_FOUND_DB || "",
  promotions: process.env.NOTION_PROMOTIONS_DB || "",
  gallery: process.env.NOTION_GALLERY_DB || "",
  documents: process.env.NOTION_DOCUMENTS_DB || "",
  inventory: process.env.NOTION_INVENTORY_DB || "",
  banners: process.env.NOTION_BANNERS_DB || "",
  // 관리자 포털
  drafts: process.env.NOTION_DRAFTS_DB || "",
  applications: process.env.NOTION_APPLICATIONS_DB || "",
  notifications: process.env.NOTION_NOTIFICATIONS_DB || "",
};

export function getTextProperty(page: Record<string, unknown>, prop: string): string {
  const properties = page.properties as Record<string, Record<string, unknown>>;
  const property = properties?.[prop];
  if (!property) return "";

  switch (property.type) {
    case "title": {
      const titleArr = property.title as Array<{ plain_text: string }>;
      return titleArr?.[0]?.plain_text || "";
    }
    case "rich_text": {
      const rtArr = property.rich_text as Array<{ plain_text: string }>;
      return rtArr?.[0]?.plain_text || "";
    }
    case "url":
      return (property.url as string) || "";
    case "email":
      return (property.email as string) || "";
    case "phone_number":
      return (property.phone_number as string) || "";
    case "select": {
      const sel = property.select as { name: string } | null;
      return sel?.name || "";
    }
    case "date": {
      const dt = property.date as { start: string } | null;
      return dt?.start || "";
    }
    case "number":
      return String(property.number ?? "");
    case "checkbox":
      return String(property.checkbox ?? false);
    default:
      return "";
  }
}

export function getFilesProperty(page: Record<string, unknown>, prop: string): string[] {
  const properties = page.properties as Record<string, Record<string, unknown>>;
  const property = properties?.[prop];
  if (!property || property.type !== "files") return [];

  const files = property.files as Array<{
    type: string;
    file?: { url: string };
    external?: { url: string };
  }>;

  return files.map((f) => (f.type === "file" ? f.file?.url : f.external?.url) || "").filter(Boolean);
}

export function getRelationIds(page: Record<string, unknown>, prop: string): string[] {
  const properties = page.properties as Record<string, Record<string, unknown>>;
  const property = properties?.[prop];
  if (!property || property.type !== "relation") return [];
  const relations = property.relation as Array<{ id: string }>;
  return relations.map((r) => r.id);
}
