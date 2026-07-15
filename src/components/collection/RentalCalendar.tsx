import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function RentalCalendar({
  onSelectRange,
  bikeId = 0
}: {
  onSelectRange: (start: Date | null, end: Date | null) => void;
  bikeId?: number;
}) {
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day;
    date.setDate(diff);
    date.setHours(0,0,0,0);
    return date;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const handleDateClick = (date: Date) => {
    const selectedDate = new Date(date);
    
    // Reset if both selected or clicking before start date
    if (startDate && endDate) {
      setStartDate(selectedDate);
      setEndDate(null);
      onSelectRange(selectedDate, null);
    } else if (startDate && !endDate) {
      if (selectedDate < startDate) {
        setStartDate(selectedDate);
        onSelectRange(selectedDate, null);
      } else {
        setEndDate(selectedDate);
        onSelectRange(startDate, selectedDate);
      }
    } else {
      setStartDate(selectedDate);
      onSelectRange(selectedDate, null);
    }
  };

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };
  
  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const isSelected = (date: Date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const start = startDate ? new Date(startDate) : null;
    if (start) start.setHours(0,0,0,0);
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(0,0,0,0);

    if (start && d.getTime() === start.getTime()) return true;
    if (end && d.getTime() === end.getTime()) return true;
    return false;
  };

  const isInRange = (date: Date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const start = startDate ? new Date(startDate) : null;
    if (start) start.setHours(0,0,0,0);
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(0,0,0,0);

    if (start && end && d > start && d < end) return true;
    return false;
  };

  const isToday = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }

  const isPast = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    return d < today;
  }

  const isUnavailable = (date: Date) => {
    const d = new Date(date);
    const daySeed = Math.floor(d.getTime() / (1000 * 60 * 60 * 24)) + bikeId;
    // Simple pseudo-random logic
    const n = Math.sin(daySeed) * 10000;
    const pseudoRand = n - Math.floor(n);
    return pseudoRand < 0.2; // 20% unavailability
  }

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const startMonth = monthNames[currentWeekStart.getMonth()];
  const endMonth = monthNames[weekEnd.getMonth()];
  const startYear = currentWeekStart.getFullYear();
  const endYear = weekEnd.getFullYear();

  const monthDisplay = startMonth === endMonth && startYear === endYear
    ? `${startMonth} ${startYear}`
    : startYear !== endYear 
      ? `${startMonth} ${startYear} - ${endMonth} ${endYear}`
      : `${startMonth} - ${endMonth} ${startYear}`;

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="bg-[#FAFAFA] border border-black/5 rounded-sm p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#050505]">
          <CalendarIcon size={14} className="text-[#D4AF37]" />
          Select Rental Dates
        </h4>
        <div className="flex gap-2 text-black/40 items-center">
          <button onClick={prevWeek} className="hover:text-[#D4AF37] transition-colors p-1"><ChevronLeft size={16} /></button>
          <span className="text-[10px] uppercase font-bold text-[#050505] min-w-[100px] text-center w-full tracking-widest">
            {monthDisplay}
          </span>
          <button onClick={nextWeek} className="hover:text-[#D4AF37] transition-colors p-1"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-[9px] font-bold text-black/30 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((date, i) => {
          const past = isPast(date);
          const unavailable = isUnavailable(date) && !past;
          return (
            <button
              key={i}
              disabled={past || unavailable}
              title={unavailable ? 'Reserved' : 'Available'}
              onClick={() => handleDateClick(date)}
              className={`
                p-2 text-xs rounded-sm transition-colors border flex items-center justify-center
                ${past ? 'text-black/20 cursor-not-allowed border-transparent' : unavailable ? 'text-black/30 bg-black/5 cursor-not-allowed border-transparent line-through' : 'hover:border-[#D4AF37] cursor-pointer'}
                ${isSelected(date) ? 'bg-[#050505] text-[#D4AF37] font-bold border-[#050505]' : isInRange(date) ? 'bg-[#D4AF37]/10 text-[#050505] border-transparent' : !past && !unavailable ? 'bg-white border-black/5 text-[#050505]' : ''}
                ${isToday(date) && !isSelected(date) && !isInRange(date) && !unavailable ? 'border-[#D4AF37] text-[#D4AF37] font-bold' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      
      {startDate && (
        <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
          <div className="text-black/40">
            From: <span className="text-[#050505] ml-1">{startDate.toLocaleDateString()}</span>
          </div>
          {endDate ? (
            <div className="text-black/40">
              To: <span className="text-[#050505] ml-1">{endDate.toLocaleDateString()}</span>
            </div>
          ) : (
            <div className="text-[#D4AF37]">
              Select Return Date
            </div>
          )}
        </div>
      )}
    </div>
  );
}
