import BoardList from "@/components/boards/BoardList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "동아리 홍보글" };

export default function PromotionsPage() {
  return <BoardList category="promotions" />;
}
