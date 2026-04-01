import type { DraftComment } from "@/lib/types";

interface ApprovalTimelineProps {
  comments: DraftComment[];
  currentStatus: string;
}

const ACTION_STYLE: Record<string, string> = {
  승인: "border-green-400 bg-green-50",
  반려: "border-red-400 bg-red-50",
  검토의견: "border-blue-300 bg-blue-50",
  수정요청: "border-amber-300 bg-amber-50",
};

const ACTION_BADGE: Record<string, string> = {
  승인: "bg-green-100 text-green-700",
  반려: "bg-red-100 text-red-600",
  검토의견: "bg-blue-100 text-blue-700",
  수정요청: "bg-amber-100 text-amber-700",
};

export default function ApprovalTimeline({ comments, currentStatus }: ApprovalTimelineProps) {
  if (comments.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-6">
        아직 결재 이력이 없습니다.
        <p className="mt-1 text-xs text-gray-400">현재 상태: <strong>{currentStatus}</strong></p>
      </div>
    );
  }

  return (
    <ol className="relative border-l-2 border-gray-200 space-y-6 pl-6">
      {comments.map((c) => (
        <li key={c.id} className="relative">
          <span className="absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white" />
          <div className={`border rounded-lg p-4 ${ACTION_STYLE[c.action] ?? "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                {c.authorName}
                <span className="ml-1 text-xs text-gray-500">({c.authorRole})</span>
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_BADGE[c.action] ?? "bg-gray-100 text-gray-600"}`}>
                {c.action}
              </span>
            </div>
            {c.content && <p className="text-sm text-gray-700 mt-1">{c.content}</p>}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(c.createdAt).toLocaleString("ko-KR")}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
