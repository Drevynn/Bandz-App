import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Artist } from '../types';
import { Search, Mail, Users } from 'lucide-react';

export const CollaborateTab = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filterGenre, setFilterGenre] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(query(collection(db, 'artists')));
        const artistData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Artist[];
        setArtists(artistData);
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter(artist => 
    (filterGenre === '' || artist.genre.toLowerCase().includes(filterGenre.toLowerCase())) &&
    (artist.collaborationStatus === 'available' || artist.collaborationStatus === 'looking')
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Collaborate</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Filter by genre..."
            className="pl-10 pr-4 py-2 rounded-lg bg-slate-800 text-white"
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <p>Loading artists...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map(artist => (
            <div key={artist.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-3">
              <h3 className="text-xl font-semibold">{artist.name}</h3>
              <p className="text-slate-400 text-sm">{artist.genre}</p>
              <p className="text-sm line-clamp-3">{artist.bio}</p>
              <div className="flex gap-2 text-xs text-slate-500">
                {artist.instruments?.map(instr => <span key={instr} className="bg-slate-700 px-2 py-1 rounded">{instr}</span>)}
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
                <Mail size={16} /> Express Interest
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
