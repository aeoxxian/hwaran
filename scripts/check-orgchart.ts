import { resolve } from "path";
import { config } from "dotenv";
import { Client } from "@notionhq/client";

config({ path: resolve(process.cwd(), ".env.local") });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const id = (process.env.NOTION_ORGCHART_DB || "").trim();

async function main() {
  console.log("DB ID:", id);
  const res = await notion.databases.query({ database_id: id, page_size: 100 });
  console.log("Total pages:", res.results.length);
  for (const p of res.results) {
    const props = (p as { properties: Record<string, Record<string, unknown>> }).properties;
    const titleArr = props["이름"]?.title as Array<{ plain_text: string }> | undefined;
    const name = titleArr?.[0]?.plain_text ?? "(no name)";
    const deptArr = props["부서"]?.rich_text as Array<{ plain_text: string }> | undefined;
    const dept = deptArr?.[0]?.plain_text ?? "(no dept)";
    const titleArr2 = props["직책"]?.rich_text as Array<{ plain_text: string }> | undefined;
    const title = titleArr2?.[0]?.plain_text ?? "(no title)";
    const order = (props["순서"]?.number as number | null) ?? null;
    console.log(`  - ${name} / ${title} / ${dept} / order: ${order}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
