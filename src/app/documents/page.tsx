import { getDocuments } from "@/lib/data";
import type { Metadata } from "next";
import DocumentsClient from "@/components/documents/DocumentsClient";

export const metadata: Metadata = { title: "자료실" };

export default async function DocumentsPage() {
  const documents = await getDocuments();
  return <DocumentsClient documents={documents} />;
}
