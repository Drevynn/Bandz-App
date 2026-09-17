import React, { useState } from 'react';
import { Gig, EventType } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Music, 
  Disc, 
  Mic2, 
  Users, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { motion } from 'motion/react';

interface CalendarViewProps {
  gigs: Gig[];
  onSelectGig: (gig: Gig) => void;
  selectedGig: Gig | null;
  onQuickAddDate?: (dateStr: string) => void;
}

export const EVENT_TYPE_CONFIG: Record<EventType, {
  label: string;
  badgeLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClasses: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    activeBg: string;
  };
}> = {
  gig: {
    label: 'Concert / Live Gig',
    badgeLabel: 'Live Show',
    icon: Music,
    colorClasses: {
      bg: 'bg-purple-950/60 hover:bg-purple-900/60',
      border: 'border-purple-500/40',
      text: 'text-purple-200',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      activeBg: 'bg-purple-600 text-white shadow-sm shadow-purple-600/40'
    }
  },
  rehearsal: {
    label: 'Band Rehearsal',
    badgeLabel: 'Rehearsal',
    icon: Disc,
    colorClasses: {
      bg: 'bg-emerald-950/60 hover:bg-emerald-900/60',
      border: 'border-emerald-500/40',
      text: 'text-emerald-200',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      activeBg: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/40'
    }
  },
  recording: {
    label: 'Recording Session',
    badgeLabel: 'Studio',
    icon: Mic2,
    colorClasses: {
      bg: 'bg-amber-950/60 hover:bg-amber-900/60',
      border: 'border-amber-500/40',
      text: 'text-amber-200',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      activeBg: 'bg-amber-600 text-white shadow-sm shadow-amber-600/40'
    }
  },
  meeting: {
    label: 'Band Business Meeting',
    badgeLabel: 'Meeting',
    icon: Users,
    colorClasses: {
      bg: 'bg-sky-950/60 hover:bg-sky-900/60',
      border: 'border-sky-500/40',
      text: 'text-sky-200',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      activeBg: 'bg-sky-600 text-white shadow-sm shadow-sky-600/40'
    }
  }
};

export default function CalendarView({ gigs, onSelectGig, selectedGig, onQuickAddDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    // If there are gigs, start at the month of the first gig, otherwise current date
    if (gigs.length > 0) {
      const firstDate = new Date(gigs[0].dateTime);
      if (!isNaN(firstDate.getTime())) {
        return new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      }
    }
    return new Date();
  });

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | EventType>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter gigs by eventType
  const filteredEvents = gigs.filter(g => {
    const type: EventType = g.eventType || 'gig';
    return selectedTypeFilter === 'all' || type === selectedTypeFilter;
  });

  // Calculate monthly stats
  const monthEvents = gigs.filter(g => {
    const d = new Date(g.dateTime);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const gigCount = monthEvents.filter(g => (g.eventType || 'gig') === 'gig').length;
  const rehearsalCount = monthEvents.filter(g => g.eventType === 'rehearsal').length;
  const recordingCount = monthEvents.filter(g => g.eventType === 'recording').length;
  const meetingCount = monthEvents.filter(g => g.eventType === 'meeting').length;

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col gap-4">
      {/* Month Navigation & Controls Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-purple-400" />
          <h2 className="text-base font-bold text-slate-100">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
            {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={resetToToday}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={prevMonth}
              title="Previous Month"
              aria-label="Previous Month"
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextMonth}
              title="Next Month"
              aria-label="Next Month"
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Event Type Filter Pills */}
      <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800/50">
        <button
          onClick={() => setSelectedTypeFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
            selectedTypeFilter === 'all'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All ({monthEvents.length})
        </button>

        <button
          onClick={() => setSelectedTypeFilter('gig')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
            selectedTypeFilter === 'gig'
              ? EVENT_TYPE_CONFIG.gig.colorClasses.activeBg
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-purple-300 hover:bg-slate-800'
          }`}
        >
          <Music size={11} />
          <span>Gigs ({gigCount})</span>
        </button>

        <button
          onClick={() => setSelectedTypeFilter('rehearsal')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
            selectedTypeFilter === 'rehearsal'
              ? EVENT_TYPE_CONFIG.rehearsal.colorClasses.activeBg
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-emerald-300 hover:bg-slate-800'
          }`}
        >
          <Disc size={11} />
          <span>Rehearsals ({rehearsalCount})</span>
        </button>

        <button
          onClick={() => setSelectedTypeFilter('recording')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
            selectedTypeFilter === 'recording'
              ? EVENT_TYPE_CONFIG.recording.colorClasses.activeBg
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-amber-300 hover:bg-slate-800'
          }`}
        >
          <Mic2 size={11} />
          <span>Recordings ({recordingCount})</span>
        </button>

        <button
          onClick={() => setSelectedTypeFilter('meeting')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
            selectedTypeFilter === 'meeting'
              ? EVENT_TYPE_CONFIG.meeting.colorClasses.activeBg
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-sky-300 hover:bg-slate-800'
          }`}
        >
          <Users size={11} />
          <span>Meetings ({meetingCount})</span>
        </button>
      </div>

      {/* Calendar Day Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider py-1">
            {day}
          </div>
        ))}

        {padding.map((_, i) => (
          <div key={`pad-${i}`} className="min-h-24 bg-slate-950/20 rounded-xl border border-slate-900/40 opacity-30" />
        ))}

        {days.map(day => {
          const date = new Date(year, month, day);
          const isToday = new Date().toDateString() === date.toDateString();
          const dayEvents = filteredEvents.filter(g => new Date(g.dateTime).toDateString() === date.toDateString());
          
          return (
            <div 
              key={day} 
              className={`min-h-24 bg-slate-950/60 rounded-xl border p-1.5 flex flex-col justify-between transition-colors ${
                isToday 
                  ? 'border-purple-500/50 shadow-sm shadow-purple-500/10' 
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold px-1 rounded ${
                  isToday 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-400'
                }`}>
                  {day}
                </span>

                {dayEvents.length > 0 && (
                  <span className="text-[9px] font-mono text-slate-500">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1 overflow-y-auto max-h-20 pr-0.5">
                {dayEvents.map(event => {
                  const type: EventType = event.eventType || 'gig';
                  const config = EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.gig;
                  const Icon = config.icon;
                  const isSelected = selectedGig?.id === event.id;
                  const timeFormatted = new Date(event.dateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

                  return (
                    <button
                      key={event.id}
                      onClick={() => onSelectGig(event)}
                      title={`${config.label}: ${event.title} at ${timeFormatted}`}
                      className={`text-[9px] p-1.5 rounded-lg w-full text-left font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                        isSelected 
                          ? config.colorClasses.activeBg + ' ring-1 ring-white/50' 
                          : `${config.colorClasses.bg} ${config.colorClasses.border} ${config.colorClasses.text}`
                      }`}
                    >
                      <Icon size={10} className="shrink-0" />
                      <span className="truncate flex-1">{event.title}</span>
                      <span className="text-[8px] font-mono opacity-80 shrink-0 hidden sm:inline">
                        {timeFormatted}
                      </span>
                    </button>
                  );
                })}
              </div>

              {dayEvents.length === 0 && onQuickAddDate && (
                <button
                  type="button"
                  onClick={() => {
                    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T18:00`;
                    onQuickAddDate(formatted);
                  }}
                  className="opacity-0 hover:opacity-100 text-[8px] text-slate-500 hover:text-purple-400 text-center py-0.5 rounded transition-opacity cursor-pointer"
                >
                  + Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-300">Legend:</span>
          <span className="inline-flex items-center gap-1 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Live Gig
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Rehearsal
          </span>
          <span className="inline-flex items-center gap-1 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Recording
          </span>
          <span className="inline-flex items-center gap-1 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> Meeting
          </span>
        </div>

        <div className="text-[10px] font-mono text-slate-500">
          Showing {filteredEvents.length} scheduled sessions
        </div>
      </div>
    </div>
  );
}

