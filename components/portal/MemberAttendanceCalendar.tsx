"use client";

import { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Clock, 
  TrendingUp, 
  Award,
  Sparkles,
  Info,
  ListFilter,
  Grid
} from "lucide-react";

export interface AttendanceItem {
  id: string;
  checkInAt: string;
  dateString: string; // YYYY-MM-DD
  shift: string;
  status: string;
  verifiedBy: string;
  notes?: string | null;
}

interface MemberAttendanceCalendarProps {
  attendances: AttendanceItem[];
  membershipStartDate?: string;
  memberName: string;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MemberAttendanceCalendar({
  attendances = [],
  membershipStartDate,
  memberName,
}: MemberAttendanceCalendarProps) {
  // Calendar month state
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"calendar" | "log">("calendar");

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);

  // Index attendances by dateString for fast lookups
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceItem[]>();
    for (const a of attendances) {
      const existing = map.get(a.dateString) || [];
      existing.push(a);
      map.set(a.dateString, existing);
    }
    return map;
  }, [attendances]);

  // Month navigation
  function prevMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  }

  function nextMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  }

  function resetToToday() {
    setViewDate(new Date());
    setSelectedDay(todayStr);
  }

  const currentYear = viewDate.getFullYear();
  const currentMonthIndex = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  // Calculate days in current month grid
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  }, [currentYear, currentMonthIndex]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonthIndex, 1).getDay();
  }, [currentYear, currentMonthIndex]);

  // Monthly stats calculations
  const monthlyMetrics = useMemo(() => {
    let presentCount = 0;
    let morningCount = 0;
    let eveningCount = 0;
    let daysElapsed = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayDate = new Date(currentYear, currentMonthIndex, day, 23, 59, 59);

      if (dayDate <= today) {
        daysElapsed++;
      }

      if (attendanceMap.has(dStr)) {
        presentCount++;
        const dayVisits = attendanceMap.get(dStr)!;
        for (const v of dayVisits) {
          if (v.shift === "MORNING") morningCount++;
          else if (v.shift === "EVENING") eveningCount++;
        }
      }
    }

    const consistencyRate = daysElapsed > 0 ? Math.round((presentCount / daysElapsed) * 100) : 0;

    return {
      presentCount,
      daysElapsed,
      consistencyRate,
      morningCount,
      eveningCount,
    };
  }, [currentYear, currentMonthIndex, daysInMonth, attendanceMap, today]);

  // Calculate workout streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    let checkDate = new Date();

    // Check if attended today
    const checkTodayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if (!attendanceMap.has(checkTodayStr)) {
      // Check if attended yesterday, if not streak is 0
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, "0");
      const d = String(checkDate.getDate()).padStart(2, "0");
      const dStr = `${y}-${m}-${d}`;

      if (attendanceMap.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [attendanceMap]);

  // Selected Day Details
  const selectedDayAttendances = selectedDay ? attendanceMap.get(selectedDay) || [] : [];
  const isSelectedDayPresent = selectedDayAttendances.length > 0;
  const isSelectedDayFuture = selectedDay ? new Date(selectedDay) > today : false;

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-8 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
            <CheckCircle2 className="h-3 w-3" />
            Verified Attendance &amp; Check-In Calendar
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
            Workout Attendance History
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
            Track your workout consistency, present sessions, and missed days at M S Fitness.
          </p>
        </div>

        {/* View Toggle (Calendar Grid vs Timeline Log) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === "calendar"
                  ? "bg-white dark:bg-zinc-800 text-gold-500 font-bold shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setActiveTab("log")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                activeTab === "log"
                  ? "bg-white dark:bg-zinc-800 text-gold-500 font-bold shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              <span>Log List ({attendances.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Member Attendance KPI Summary Cards */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Present Days */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block">
            Days Attended
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="font-display text-2xl font-black text-emerald-500">
              {monthlyMetrics.presentCount}
            </h4>
            <span className="text-xs text-zinc-400 font-mono">
              / {monthlyMetrics.daysElapsed} days
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            in {viewDate.toLocaleDateString("en-IN", { month: "short" })}
          </span>
        </div>

        {/* Workout Consistency Rate */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block">
            Consistency
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="font-display text-2xl font-black text-gold-500">
              {monthlyMetrics.consistencyRate}%
            </h4>
            <TrendingUp className="h-4 w-4 text-gold-500" />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            monthly attendance rate
          </span>
        </div>

        {/* Active Streak */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block">
            Active Streak
          </span>
          <div className="mt-1 flex items-center gap-2">
            <h4 className="font-display text-2xl font-black text-orange-500">
              {currentStreak}
            </h4>
            <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            consecutive days
          </span>
        </div>

        {/* Total Lifetime Check-Ins */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block">
            Lifetime Visits
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="font-display text-2xl font-black text-zinc-950 dark:text-white">
              {attendances.length}
            </h4>
            <Award className="h-4 w-4 text-gold-500" />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            total entrance scans
          </span>
        </div>
      </div>

      {activeTab === "calendar" ? (
        <div className="mt-8 space-y-6">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <h4 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                {monthName}
              </h4>
              <button
                onClick={resetToToday}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 hover:text-gold-500 transition-colors"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                aria-label="Previous Month"
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-gold-500 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next Month"
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-gold-500 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900/30">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-center py-2.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className={day === "Sun" ? "text-amber-500" : ""}>
                  {day}
                </div>
              ))}
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800">
              {/* Empty padding slots before day 1 */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div
                  key={`pad-${i}`}
                  className="bg-white dark:bg-zinc-950 min-h-[64px] sm:min-h-[84px] p-2 opacity-30 pointer-events-none"
                />
              ))}

              {/* Real Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const dayDate = new Date(currentYear, currentMonthIndex, dayNum, 23, 59, 59);

                const isToday = dStr === todayStr;
                const isFuture = dayDate > today;
                const isSelected = selectedDay === dStr;
                const visits = attendanceMap.get(dStr) || [];
                const isPresent = visits.length > 0;
                const isSunday = (firstDayOfWeek + i) % 7 === 0;

                // Status classification
                let statusLabel = "";
                let cellBg = "bg-white dark:bg-zinc-950";
                let badgeContent = null;

                if (isPresent) {
                  statusLabel = "PRESENT";
                  cellBg = "bg-emerald-50/60 dark:bg-emerald-950/20";
                  badgeContent = (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] font-mono font-bold">
                      <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>PRESENT</span>
                    </div>
                  );
                } else if (!isFuture) {
                  statusLabel = "ABSENT";
                  badgeContent = (
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 text-zinc-500 text-[9px] sm:text-[10px] font-mono font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                      <span>{isSunday ? "REST / SUN" : "ABSENT"}</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={dStr}
                    onClick={() => setSelectedDay(dStr)}
                    className={`
                      ${cellBg}
                      min-h-[64px] sm:min-h-[84px] p-1.5 sm:p-2.5 text-left flex flex-col justify-between transition-all duration-150 relative group
                      hover:ring-2 hover:ring-gold-500/50 hover:z-10
                      ${isSelected ? "ring-2 ring-gold-500 bg-gold-500/10 z-10" : ""}
                    `}
                  >
                    {/* Top Row: Day Number & Today indicator */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`
                          text-xs sm:text-sm font-mono font-bold
                          ${isToday ? "h-6 w-6 rounded-full bg-gold-500 text-black flex items-center justify-center font-extrabold shadow-sm" : ""}
                          ${!isToday && isPresent ? "text-emerald-600 dark:text-emerald-400" : ""}
                          ${!isToday && !isPresent && !isFuture ? "text-zinc-600 dark:text-zinc-400" : ""}
                          ${isFuture ? "text-zinc-400 dark:text-zinc-600 font-light" : ""}
                        `}
                      >
                        {dayNum}
                      </span>

                      {/* Small Shift Tag on Present Days */}
                      {isPresent && visits[0] && (
                        <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1 rounded bg-black/10 dark:bg-white/10 text-zinc-600 dark:text-zinc-300">
                          {visits[0].shift}
                        </span>
                      )}
                    </div>

                    {/* Bottom Status Badge */}
                    <div className="mt-1">{badgeContent}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend Guide */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">Present (Workout Completed)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-zinc-500">Absent / Rest Day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-gold-500 ring-2 ring-gold-500/30" />
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">Today</span>
              </div>
            </div>

            <span className="text-[11px] font-mono text-zinc-500">
              Tip: Click on any day to view check-in details.
            </span>
          </div>

          {/* Selected Day Detail Card */}
          {selectedDay && (
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isSelectedDayPresent
                        ? "bg-emerald-500/20 text-emerald-500"
                        : isSelectedDayFuture
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {isSelectedDayPresent ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <CalendarIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                      Daily Inspection
                    </span>
                    <h4 className="font-display text-base font-bold text-zinc-950 dark:text-white uppercase">
                      {new Date(selectedDay).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </h4>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider w-fit ${
                    isSelectedDayPresent
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-500"
                      : isSelectedDayFuture
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {isSelectedDayPresent
                    ? "STATUS: PRESENT"
                    : isSelectedDayFuture
                    ? "STATUS: UPCOMING"
                    : "STATUS: ABSENT / REST DAY"}
                </span>
              </div>

              {isSelectedDayPresent ? (
                <div className="mt-4 space-y-2">
                  {selectedDayAttendances.map((record, idx) => {
                    const timeStr = new Date(record.checkInAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <div
                        key={record.id || idx}
                        className="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-emerald-500" />
                          <div>
                            <span className="font-bold text-zinc-950 dark:text-white font-mono">
                              Check-In Time: {timeStr}
                            </span>
                            <span className="block text-zinc-500 text-[11px] font-mono mt-0.5">
                              Shift: {record.shift} • Verified by: {record.verifiedBy.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        {record.notes && (
                          <span className="text-[11px] text-zinc-500 italic bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg">
                            {record.notes}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-xs text-zinc-500">
                  {isSelectedDayFuture
                    ? "This date is in the future. Don't forget to visit and scan your pass at the entrance!"
                    : "No check-in record registered on this date. Marked as absent or rest day."}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Log List View */
        <div className="mt-8 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[560px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Verification Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                      No attendance visits recorded yet. Present your dynamic QR pass at the entrance scanner!
                    </td>
                  </tr>
                ) : (
                  attendances.map((rec) => {
                    const checkInDate = new Date(rec.checkInAt);
                    const dateFormatted = checkInDate.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const timeFormatted = checkInDate.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={rec.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-zinc-950 dark:text-white">
                          {dateFormatted}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-700 dark:text-zinc-300">
                          {timeFormatted}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            {rec.shift}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-zinc-500 uppercase">
                          {rec.verifiedBy.replace("_", " ")}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" /> Present
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-500 font-mono text-[11px]">
                          {rec.notes || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
