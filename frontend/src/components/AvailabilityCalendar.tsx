import { useMemo, useState } from "react";

type Departure = {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  totalSeats: number;
  bookedSeats: number;
  pricePerSeat: number;
};

type AvailabilityCalendarProps = {
  departures: Departure[];
  selectedDepartureId?: string | null;
  onSelect: (departure: Departure) => void;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export function AvailabilityCalendar({
  departures,
  selectedDepartureId,
  onSelect,
}: AvailabilityCalendarProps) {
  const normalized = useMemo(() => {
    return (departures || []).map((d) => {
      const start = new Date(d.startDate);
      return {
        ...d,
        _start: start,
        _dateKey: toDateKey(start),
        _monthKey: `${start.getFullYear()}-${start.getMonth()}`,
      };
    });
  }, [departures]);

  const monthKeys = useMemo(() => {
    const keys = Array.from(
      new Set(normalized.map((d) => d._monthKey))
    ).sort((a, b) => {
      const [ay, am] = a.split("-").map(Number);
      const [by, bm] = b.split("-").map(Number);
      if (ay !== by) return ay - by;
      return am - bm;
    });

    if (keys.length === 0) {
      const now = new Date();
      return [`${now.getFullYear()}-${now.getMonth()}`];
    }
    return keys;
  }, [normalized]);

  const [activeMonth, setActiveMonth] = useState(monthKeys[0]);

  const [year, month] = activeMonth.split("-").map(Number);
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDateKey = useMemo(() => {
    const map = new Map<string, Departure & { _start: Date }>();
    for (const dep of normalized) {
      map.set(dep._dateKey, dep as Departure & { _start: Date });
    }
    return map;
  }, [normalized]);

  const days = Array.from({ length: 42 }).map((_, index) => {
    const dayNumber = index - startOffset + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    const date = new Date(year, month, dayNumber);
    const key = toDateKey(date);
    const dep = byDateKey.get(key);
    const seatsLeft = dep
      ? dep.totalSeats - dep.bookedSeats
      : 0;
    const status = dep
      ? seatsLeft <= 0
        ? "booked"
        : seatsLeft <= 5
        ? "filling"
        : "available"
      : "none";
    return { date, key, dep, seatsLeft, status };
  });

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-lg font-semibold">Availability</div>
      <div className="text-sm text-gray-500">
        Select a date to book your trek.
      </div>

      <div className="flex items-center gap-3 text-xs mt-3">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
          Filling Fast
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          Booked
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {monthKeys.map((key) => {
          const [y, m] = key.split("-").map(Number);
          const label = `${MONTHS[m]} ${y}`;
          return (
            <button
              key={key}
              onClick={() => setActiveMonth(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                key === activeMonth
                  ? "bg-maroon text-white border-maroon"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-7 text-xs text-gray-500 gap-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const isSelected =
            day.dep && day.dep.id === selectedDepartureId;
          const statusClass =
            day.status === "available"
              ? "border-emerald-500 text-emerald-700 bg-emerald-50"
              : day.status === "filling"
              ? "border-orange-400 text-orange-700 bg-orange-50"
              : day.status === "booked"
              ? "border-rose-400 text-rose-700 bg-rose-50"
              : "border-gray-200 text-gray-400 bg-white";

          return (
            <button
              key={day.key}
              disabled={!day.dep || day.status === "booked"}
              onClick={() => day.dep && onSelect(day.dep)}
              className={`h-10 rounded-lg border text-xs font-semibold transition ${
                isSelected ? "ring-2 ring-maroon" : ""
              } ${statusClass} ${
                day.dep && day.status !== "booked"
                  ? "hover:shadow-sm"
                  : "cursor-default"
              }`}
              title={
                day.dep
                  ? `${day.seatsLeft} seats left`
                  : "No departures"
              }
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
