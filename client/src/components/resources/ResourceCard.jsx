import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, ShieldCheck, ArrowRight, CheckCircle2, Eye, Calendar } from 'lucide-react';
import PhysicalVisitModal from '../bookings/PhysicalVisitModal';

export default function ResourceCard({ resource }) {
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const isFree = Number(resource.fee_per_hour) === 0;
  const image = resource.primary_image || resource.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80';
  const isAvailable = resource.status === 'active';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Image Header with Badges */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src={image}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top Badges: Category & Type */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-slate-800 backdrop-blur-sm shadow-sm">
              {resource.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-900/90 text-white backdrop-blur-sm shadow-sm capitalize">
              {resource.type}
            </span>
          </div>

          {/* Availability Badge */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-sm ${
              isAvailable
                ? 'bg-emerald-600/90 text-white'
                : 'bg-amber-600/90 text-white'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-white'}`} />
              <span>{isAvailable ? 'Available Now' : 'Reserved / Maintenance'}</span>
            </span>
          </div>

          {/* Cost Tag */}
          <div className="absolute bottom-3 right-3">
            <span className={`px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md shadow-md ${
              isFree
                ? 'bg-emerald-600/95 text-white'
                : 'bg-white/95 text-slate-900'
            }`}>
              {isFree ? 'Free Campus Access' : `₹${Number(resource.fee_per_hour).toLocaleString('en-IN')} / hr`}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition line-clamp-2 leading-snug mb-2">
              <Link to={`/resources/${resource.id}`}>{resource.title}</Link>
            </h3>

            <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
              {resource.description}
            </p>

            {/* Consistent Scanning Grid: Availability, Location, Cost, Training */}
            <div className="space-y-2 text-xs text-slate-600 mb-4 border-t border-slate-100 pt-3">
              {/* Location */}
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
                <span className="truncate font-medium text-slate-800">{resource.location}</span>
              </div>

              {/* Cost & Capacity */}
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                  <span className="text-emerald-700 font-bold">
                    {isFree ? 'Free Access' : `₹${Number(resource.fee_per_hour).toLocaleString('en-IN')} / hour`}
                  </span>
                  {!isFree && (
                    <span className="text-[10px] text-slate-400 font-normal">(50% adv)</span>
                  )}
                </div>
                <div className="flex items-center space-x-1.5 text-slate-500">
                  <Users className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Cap: {resource.capacity || 1}</span>
                </div>
              </div>

              {/* Training Requirement */}
              <div className="pt-1">
                {resource.requires_training ? (
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Safety / Training Required</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Open Access (No Prior Training)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual CTA Buttons: View Details & Request Physical Visit */}
      <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
          <span className="truncate">Host: <strong className="text-slate-700">{resource.owner_name || 'Dr. Sarah Jenkins'}</strong></span>
          <span className="text-emerald-600 font-medium">Free Visit Available</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/resources/${resource.id}`}
            aria-label={`View Details for ${resource.title}`}
            className="inline-flex items-center justify-center space-x-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2 px-2.5 rounded-xl transition text-center"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </Link>
          <button
            type="button"
            onClick={() => setVisitModalOpen(true)}
            aria-label={`Request Physical Visit for ${resource.title}`}
            className="inline-flex items-center justify-center space-x-1 text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 py-2 px-2.5 rounded-xl transition text-center shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Request Visit</span>
          </button>
        </div>
      </div>

      {/* Physical Visit Modal */}
      <PhysicalVisitModal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        resource={resource}
      />
    </div>
  );
}
