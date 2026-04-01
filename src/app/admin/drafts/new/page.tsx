import DraftForm from "@/components/admin/DraftForm";
import Link from "next/link";

export const metadata = { title: "기안 작성" };

export default function NewDraftPage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/drafts" className="text-sm text-gray-500 hover:text-primary">
          ← 기안 목록
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">기안 작성</h1>
        <p className="text-sm text-gray-500 mt-1">
          기안을 작성하고 상신하면 권한에 따라 순차 결재가 진행됩니다.
        </p>
      </div>
      <DraftForm />
    </div>
  );
}
