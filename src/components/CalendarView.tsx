import React from 'react';
import { Gig } from '../types';
import { motion } from 'motion/react';

interface CalendarViewProps {
  gigs: Gig[];
  onSelectGig: (gig: Gig) => void;
  selectedGig: Gig | null;
}

export default function CalendarView({ gigs, onSelectGig, selectedGig }: CalendarViewProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
      <div className="text-sm font-semibold text-slate-300 mb-4 text-center">
        {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase">{day}</div>
        ))}
        {padding.map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const date = new Date(year, month, day);
          const dayGigs = gigs.filter(g => new Date(g.dateTime).toDateString() === date.toDateString());
          
          return (
            <div key={day} className="h-20 bg-slate-950/40 rounded-lg border border-slate-800 p-1.5 flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400">{day}</span>
              {dayGigs.map(gig => (
                <button
                  key={gig.id}
                  onClick={() => onSelectGig(gig)}
                  className={`text-[8px] truncate p-1 rounded-sm w-full text-left font-semibold ${selectedGig?.id === gig.id ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  {gig.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
