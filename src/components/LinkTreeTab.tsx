import React, { useState } from 'react';
import { Artist } from '../types';
import { Guitar, Instagram, UserCircle } from 'lucide-react';

interface LinkTreeTabProps {
  artists: Artist[];
}

export default function LinkTreeTab({ artists }: LinkTreeTabProps) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(artists[0] || null);

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="link-tree-tab-root">
      <div>
        <h1 className="text-3xl font-bold font-display text-slate-100 flex items-center gap-3">
          <UserCircle className="text-amber-500" />
          Band Link Tree
        </h1>
        <p className="text-slate-400 mt-2">Central hub for band members, roles, and gear.</p>
      </div>

      <select
        value={selectedArtist?.id || ''}
        onChange={(e) => setSelectedArtist(artists.find(a => a.id === e.target.value) || null)}
        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-amber-500"
      >
        {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      {selectedArtist && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-100">{selectedArtist.name} Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedArtist.members.map(member => (
              <div key={member.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-100 text-lg">{member.name}</h4>
                    <span className="text-xs bg-amber-500/10 text-amber-500 font-semibold px-3 py-1 rounded-full">{member.role}</span>
                </div>
                
                <div className="flex gap-4">
                    {member.gearLink && (
                        <a href={member.gearLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 text-sm hover:text-amber-500 transition-colors">
                            <Guitar size={16} /> Gear
                        </a>
                    )}
                    {member.instagramUrl && (
                        <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 text-sm hover:text-amber-500 transition-colors">
                            <Instagram size={16} /> Social
                        </a>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
