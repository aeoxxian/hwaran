import { getDocuments } from "@/lib/data";
import DocumentManager from "@/components/admin/content/DocumentManager";

export const metadata = { title: "자료실 관리" };
export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const documents = await getDocuments();
  return <DocumentManager documents={documents} />;
}
