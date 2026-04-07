"use client";

import { useState, useMemo } from "react";
import type { CalendarEvent } from "@/lib/types";

export default function CalendarClient({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    return arr;
  }, [firstDay, daysInMonth]);

  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const start = new Date(e.startDate);
      return start.getFullYear() === year && start.getMonth() === month;
    });
  }, [events, year, month]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => {
      return e.startDate <= dateStr && e.endDate >= dateStr;
    });
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="container-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">캘린더</h1>
        <p className="section-subtitle">동아리별 일정을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card !p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-primary text-white">
              <button onClick={prevMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-semibold text-gray-text border-b border-gray-border">
                  {day}
                </div>
              ))}
              {days.map((day, idx) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const isSelected = day === selectedDay;
                return (
                  <div
                    key={idx}
                    onClick={() => day && setSelectedDay(day)}
                    className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 border-b border-r border-gray-border cursor-pointer hover:bg-primary-50/50 transition-colors ${
                      isSelected ? "bg-primary-50" : ""
                    } ${!day ? "bg-gray-light/30" : ""}`}
                  >
                    {day && (
                      <>
                        <span className={`text-sm font-medium ${idx % 7 === 0 ? "text-red-500" : idx % 7 === 6 ? "text-blue-500" : "text-dark"}`}>
                          {day}
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map((evt) => (
                            <div
                              key={evt.id}
                              className="text-[10px] sm:text-xs px-1 py-0.5 rounded truncate text-white"
                              style={{ backgroundColor: evt.color || "#E05252" }}
                            >
                              {evt.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[10px] text-gray-text">+{dayEvents.length - 2}개</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 className="font-bold text-dark mb-4">
              {selectedDay
                ? `${month + 1}월 ${selectedDay}일 일정`
                : `${month + 1}월 전체 일정`}
            </h3>
            <div className="space-y-3">
              {(selectedDay ? selectedEvents : monthEvents).length === 0 ? (
                <p className="text-gray-text text-sm">등록된 일정이 없습니다.</p>
              ) : (
                (selectedDay ? selectedEvents : monthEvents).map((event) => (
                  <div key={event.id} className="flex gap-3 p-3 rounded-lg bg-gray-light">
                    <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: event.color || "#E05252" }} />
                    <div>
                      <h4 className="font-semibold text-sm text-dark">{event.title}</h4>
                      {event.clubName && <p className="text-xs text-gray-text">{event.clubName}</p>}
                      <p className="text-xs text-gray-text mt-1">{event.startDate}{event.startDate !== event.endDate ? ` ~ ${event.endDate}` : ""}</p>
                      {event.location && (
                        <p className="text-xs text-gray-text flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
