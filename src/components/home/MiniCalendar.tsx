"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarEvent } from "@/lib/types";

interface MiniCalendarProps {
  events: CalendarEvent[];
}

export default function MiniCalendar({ events }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = currentDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });

  const days = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [firstDay, daysInMonth]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.startDate <= dateStr && e.endDate >= dateStr);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-dark">다가오는 일정</h2>
        <Link href="/calendar" className="text-sm text-primary hover:text-primary-dark">캘린더 보기</Link>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 rounded hover:bg-gray-light" aria-label="이전 달">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <p className="text-sm font-semibold text-dark">{monthLabel}</p>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 rounded hover:bg-gray-light" aria-label="다음 달">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-gray-text mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          return (
            <div key={idx} className={`h-9 rounded text-center text-xs flex items-center justify-center relative ${day ? "bg-gray-light/60 text-dark" : "bg-transparent"}`}>
              {day && <span>{day}</span>}
              {dayEvents.length > 0 && <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
