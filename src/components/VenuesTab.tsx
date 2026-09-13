import React, { useState } from 'react';
import { Venue } from '../types';
import {
  Building2,
  MapPin,
  Users,
  Phone,
  Mail,
  Globe,
  Sliders,
  Volume2,
  Music,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Check,
  X,
  FileText,
  CalendarPlus,
  ShieldCheck,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import VenueSearchModal from './VenueSearchModal';

interface VenuesTabProps {
  venues: Venue[];
  onAddVenue: (venue: Venue) => void;
  onUpdateVenue: (venue: Venue) => void;
  onDeleteVenue: (venueId: string) => void;
  onScheduleGigAtVenue?: (venue: Venue) => void;
}

export default function VenuesTab({
  venues,
  onAddVenue,
  onUpdateVenue,
  onDeleteVenue,
  onScheduleGigAtVenue,
}: VenuesTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCapacity, setFormCapacity] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formPa, setFormPa] = useState('');
  const [formLighting, setFormLighting] = useState('');
  const [formDrums, setFormDrums] = useState('');
  const [formAmps, setFormAmps] = useState('');
  const [formMics, setFormMics] = useState('');
  const [formStageDim, setFormStageDim] = useState('');
  const [formTechNotes, setFormTechNotes] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // AI Venue Search Modal State
  const [showAiSearchModal, setShowAiSearchModal] = useState(false);

  const filteredVenues = venues.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.contactPerson && v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAddModal = () => {
    setEditingVenueId(null);
    setFormName('');
    setFormAddress('');
    setFormContactPerson('');
    setFormPhone('');
    setFormEmail('');
    setFormCapacity('');
    setFormWebsite('');
    setFormPa('');
    setFormLighting('');
    setFormDrums('');
    setFormAmps('');
    setFormMics('');
    setFormStageDim('');
    setFormTechNotes('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (venue: Venue) => {
    setEditingVenueId(venue.id);
    setFormName(venue.name);
    setFormAddress(venue.address);
    setFormContactPerson(venue.contactPerson || '');
    setFormPhone(venue.phone || '');
    setFormEmail(venue.email || '');
    setFormCapacity(venue.capacity || '');
    setFormWebsite(venue.website || '');
    setFormPa(venue.techEquipment?.paSoundSystem || '');
    setFormLighting(venue.techEquipment?.lighting || '');
    setFormDrums(venue.techEquipment?.drumKit || '');
    setFormAmps(venue.techEquipment?.amps || '');
    setFormMics(venue.techEquipment?.micsDi || '');
    setFormStageDim(venue.techEquipment?.stageDimensions || '');
    setFormTechNotes(venue.techEquipment?.notes || '');
    setFormNotes(venue.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) return;

    const venueData: Venue = {
      id: editingVenueId || `venue-${Date.now()}`,
      name: formName.trim(),
      address: formAddress.trim(),
      contactPerson: formContactPerson.trim() || undefined,
      phone: formPhone.trim() || undefined,
      email: formEmail.trim() || undefined,
      capacity: formCapacity.trim() || undefined,
      website: formWebsite.trim() || undefined,
      techEquipment: {
        paSoundSystem: formPa.trim() || undefined,
        lighting: formLighting.trim() || undefined,
        drumKit: formDrums.trim() || undefined,
        amps: formAmps.trim() || undefined,
        micsDi: formMics.trim() || undefined,
        stageDimensions: formStageDim.trim() || undefined,
        notes: formTechNotes.trim() || undefined,
      },
      notes: formNotes.trim() || undefined,
    };

    if (editingVenueId) {
      onUpdateVenue(venueData);
      if (selectedVenue && selectedVenue.id === editingVenueId) {
        setSelectedVenue(venueData);
      }
    } else {
      onAddVenue(venueData);
    }

    setIsModalOpen(false);
  };

  const handleApplyAiVenueData = (data: {
    venueName?: string;
    address?: string;
    fullVenueData?: any;
  }) => {
    if (!data.fullVenueData) return;
    const v = data.fullVenueData;
    setFormName(v.venueName || data.venueName || '');
    setFormAddress(v.address || data.address || '');
    setFormCapacity(v.capacity || '');
    setFormEmail(v.contactInfo?.email && v.contactInfo.email !== 'None listed' ? v.contactInfo.email : '');
    setFormPhone(v.contactInfo?.phone && v.contactInfo.phone !== 'None listed' ? v.contactInfo.phone : '');
    setFormWebsite(v.contactInfo?.website || '');
    setFormPa(v.backlineSpecs?.paSoundSystem || '');
    setFormLighting(v.backlineSpecs?.lightingMonitors || '');
    setFormDrums(v.backlineSpecs?.drumKit || '');
    setFormAmps(v.backlineSpecs?.guitarBassAmps || '');
    setFormMics(v.backlineSpecs?.microphonesDi || '');
    setFormStageDim(v.backlineSpecs?.stageDimensions || '');
    setFormTechNotes(v.logistics?.loadInInstructions || '');
    setFormNotes(v.summaryText || '');
    setShowAiSearchModal(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: "url('/src/assets/images/venue_backstage_header_1788820358944.jpg')" }} />
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Directory & Tech Riders
            </span>
            <span className="text-xs text-slate-400">{venues.length} Venues Saved</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2.5">
            <Building2 className="text-purple-400" size={26} />
            Venue Management System
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            Manage venue contacts, capacities, addresses, and technical equipment riders. Instantly reference sound and lighting specs when scheduling your upcoming tour dates.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowAiSearchModal(true)}
            className="bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Sparkles size={15} className="text-purple-400 animate-pulse" />
            <span>Search Venue via Google AI</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
          >
            <Plus size={16} />
            <span>Add New Venue</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search venues by name, city, address, or booking contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Venues Grid */}
      {filteredVenues.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-purple-950/50 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
            <Building2 size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No venues found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm ? 'No venues match your search filter.' : 'Add your first venue or use Google AI search to build your venue roster.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} /> Add Venue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVenues.map((venue) => (
            <motion.div
              key={venue.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold font-display text-slate-100 group-hover:text-purple-300 transition-colors">
                      {venue.name}
                    </h3>
                    {venue.capacity && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md mt-1">
                        <Users size={11} /> {venue.capacity}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(venue)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Edit Venue"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete venue "${venue.name}"?`)) {
                          onDeleteVenue(venue.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                      title="Delete Venue"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-xs text-slate-300">
                  <MapPin size={14} className="text-purple-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{venue.address}</span>
                </div>

                {/* Contact Person & Info */}
                {(venue.contactPerson || venue.phone || venue.email) && (
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                    {venue.contactPerson && (
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span className="text-slate-500 font-normal">Contact:</span> {venue.contactPerson}
                      </div>
                    )}
                    {venue.phone && (
                      <div className="text-slate-300 flex items-center gap-1.5">
                        <Phone size={11} className="text-purple-400 shrink-0" />
                        <span>{venue.phone}</span>
                      </div>
                    )}
                    {venue.email && (
                      <div className="text-purple-300 flex items-center gap-1.5 truncate">
                        <Mail size={11} className="shrink-0" />
                        <a href={`mailto:${venue.email}`} className="hover:underline truncate">{venue.email}</a>
                      </div>
                    )}
                  </div>
                )}

                {/* Technical Equipment Summary Tags */}
                {venue.techEquipment && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tech Specs & Rider</span>
                    <div className="flex flex-wrap gap-1.5">
                      {venue.techEquipment.paSoundSystem && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                          <Volume2 size={10} /> PA System
                        </span>
                      )}
                      {venue.techEquipment.lighting && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                          <Sliders size={10} /> Lighting Rig
                        </span>
                      )}
                      {venue.techEquipment.drumKit && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-500/30 text-blue-300 flex items-center gap-1">
                          <Music size={10} /> Drum Kit
                        </span>
                      )}
                      {venue.techEquipment.stageDimensions && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {venue.techEquipment.stageDimensions}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVenue(venue)}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FileText size={13} />
                  <span>View Full Rider</span>
                </button>

                {onScheduleGigAtVenue && (
                  <button
                    type="button"
                    onClick={() => onScheduleGigAtVenue(venue)}
                    className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Schedule gig at this venue"
                  >
                    <CalendarPlus size={13} />
                    <span>Schedule Gig</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Full Venue Details & Rider Modal */}
      <AnimatePresence>
        {selectedVenue && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 text-slate-200 max-h-[90vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Venue Technical Rider
                    </span>
                    {selectedVenue.capacity && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Capacity: {selectedVenue.capacity}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-100">{selectedVenue.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin size={13} className="text-purple-400" /> {selectedVenue.address}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedVenue(null)}
                  className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contacts */}
              {(selectedVenue.contactPerson || selectedVenue.phone || selectedVenue.email || selectedVenue.website) && (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Booking & Management Contacts</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedVenue.contactPerson && (
                      <div><span className="text-slate-500">Contact:</span> <strong className="text-slate-200">{selectedVenue.contactPerson}</strong></div>
                    )}
                    {selectedVenue.phone && (
                      <div className="flex items-center gap-1.5"><Phone size={12} className="text-purple-400" /> <span className="text-slate-200">{selectedVenue.phone}</span></div>
                    )}
                    {selectedVenue.email && (
                      <div className="flex items-center gap-1.5 truncate"><Mail size={12} className="text-purple-400" /> <a href={`mailto:${selectedVenue.email}`} className="text-purple-300 hover:underline">{selectedVenue.email}</a></div>
                    )}
                    {selectedVenue.website && (
                      <div className="flex items-center gap-1.5 truncate"><Globe size={12} className="text-blue-400" /> <a href={selectedVenue.website} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline flex items-center gap-1"><span>Official Website</span> <ExternalLink size={10} /></a></div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Equipment & Rider */}
              {selectedVenue.techEquipment && (
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sliders size={14} className="text-purple-400" /> Technical Equipment & Audio Rider
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    {selectedVenue.techEquipment.paSoundSystem && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <strong className="text-purple-300 block mb-0.5">PA Sound System & Console:</strong>
                        <span className="text-slate-300">{selectedVenue.techEquipment.paSoundSystem}</span>
                      </div>
                    )}
                    {selectedVenue.techEquipment.lighting && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <strong className="text-amber-300 block mb-0.5">Stage Lighting & Rig:</strong>
                        <span className="text-slate-300">{selectedVenue.techEquipment.lighting}</span>
                      </div>
                    )}
                    {selectedVenue.techEquipment.drumKit && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <strong className="text-blue-300 block mb-0.5">House Drum Kit:</strong>
                        <span className="text-slate-300">{selectedVenue.techEquipment.drumKit}</span>
                      </div>
                    )}
                    {selectedVenue.techEquipment.amps && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <strong className="text-emerald-300 block mb-0.5">Guitar & Bass Amps:</strong>
                        <span className="text-slate-300">{selectedVenue.techEquipment.amps}</span>
                      </div>
                    )}
                    {selectedVenue.techEquipment.micsDi && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <strong className="text-indigo-300 block mb-0.5">Microphones & DIs:</strong>
                        <span className="text-slate-300">{selectedVenue.techEquipment.micsDi}</span>
                      </div>
                    )}
                    {selectedVenue.techEquipment.stageDimensions && (
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <strong className="text-slate-300 block mb-0.5">Stage Dimensions:</strong>
                        <span className="text-slate-300">{selectedVenue.techEquipment.stageDimensions}</span>
                      </div>
                    )}
                  </div>
                  {selectedVenue.techEquipment.notes && (
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                      <strong className="text-slate-400 block mb-0.5">Load-in & Soundcheck Instructions:</strong>
                      <span className="text-slate-300">{selectedVenue.techEquipment.notes}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedVenue.notes && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">General Venue Notes</span>
                  <p>{selectedVenue.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const v = selectedVenue;
                    setSelectedVenue(null);
                    handleOpenEditModal(v);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Edit Venue
                </button>
                {onScheduleGigAtVenue && (
                  <button
                    type="button"
                    onClick={() => {
                      const v = selectedVenue;
                      setSelectedVenue(null);
                      onScheduleGigAtVenue(v);
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-purple-600/20"
                  >
                    Schedule Gig Here
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Venue Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 text-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold font-display text-slate-100">
                    {editingVenueId ? 'Edit Venue Details' : 'Add New Venue'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enter contact info, room capacity, and technical sound/lighting equipment specifications.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Venue Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., The Crocodile"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Room Capacity</label>
                    <input
                      type="text"
                      placeholder="e.g., 550 standing"
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Full Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="2505 1st Ave, Seattle, WA 98121"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="Talent Buyer / Booker"
                      value={formContactPerson}
                      onChange={(e) => setFormContactPerson(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="(206) 555-0199"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Booking Email</label>
                    <input
                      type="email"
                      placeholder="booking@venue.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Official Website</label>
                  <input
                    type="text"
                    placeholder="https://venue.com"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Technical Equipment Section */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Sliders size={14} className="text-purple-400" /> Technical Equipment & Sound Rider
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">PA Sound System & Console</label>
                      <input
                        type="text"
                        placeholder="e.g. Midas M32, QSC Line Array"
                        value={formPa}
                        onChange={(e) => setFormPa(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Lighting & DMX Rig</label>
                      <input
                        type="text"
                        placeholder="e.g. Chauvet LED wash lights"
                        value={formLighting}
                        onChange={(e) => setFormLighting(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">House Drum Kit</label>
                      <input
                        type="text"
                        placeholder="e.g. Yamaha Stage Custom shells"
                        value={formDrums}
                        onChange={(e) => setFormDrums(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Guitar & Bass Amps</label>
                      <input
                        type="text"
                        placeholder="e.g. Fender Twin Reverb, Ampeg 8x10"
                        value={formAmps}
                        onChange={(e) => setFormAmps(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Mics & DI Boxes</label>
                      <input
                        type="text"
                        placeholder="e.g. Shure SM58/57, Radial DIs"
                        value={formMics}
                        onChange={(e) => setFormMics(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Stage Dimensions</label>
                      <input
                        type="text"
                        placeholder="e.g. 24ft wide x 16ft deep"
                        value={formStageDim}
                        onChange={(e) => setFormStageDim(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Load-in & Soundcheck Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Alley load-in, parking instructions, soundcheck time window..."
                      value={formTechNotes}
                      onChange={(e) => setFormTechNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 mb-1">General Venue Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Hospitality, dressing rooms, merch percentage split..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-400 px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
                  >
                    {editingVenueId ? 'Save Changes' : 'Save Venue'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google AI Venue Search Modal */}
      <VenueSearchModal
        isOpen={showAiSearchModal}
        onClose={() => setShowAiSearchModal(false)}
        onApplyVenueData={handleApplyAiVenueData}
      />
    </div>
  );
}
