import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import PhysicalVisitModal from '../../components/bookings/PhysicalVisitModal';
import {
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Info,
  CheckCircle2,
  FileText,
  User,
  ArrowLeft,
  Building,
  CreditCard,
  Lock
} from 'lucide-react';

export default function ResourceDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visitModalOpen, setVisitModalOpen] = useState(false);

  // Booking Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [purpose, setPurpose] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    async function loadResource() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/resources/${id}`);
        if (res.data.success) {
          setResource(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load resource details.');
      } finally {
        setLoading(false);
      }
    }
    loadResource();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage text="Retrieving resource specifications..." />;
  if (error || !resource) return <div className="max-w-4xl mx-auto p-8"><ErrorMessage message={error || 'Resource not found'} /></div>;

  // Compute calculated duration & 50/50 price breakdown
  const calculateEstimate = () => {
    if (!startTime || !endTime) return { hours: 0, total: 0, advance: 0, remaining: 0 };
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const totalHours = (endH + endM / 60) - (startH + startM / 60);
    const validHours = Math.max(0, totalHours);
    const totalFee = Math.round(validHours * Number(resource.fee_per_hour) * 100) / 100;
    const advanceFee = Math.round(totalFee * 50) / 100;
    const remainingFee = Math.round((totalFee - advanceFee) * 100) / 100;
    return { hours: validHours, total: totalFee, advance: advanceFee, remaining: remainingFee };
  };

  const { hours, total, advance, remaining } = calculateEstimate();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/resources/${id}` } });
      return;
    }

    setBookingError(null);
    setBookingSuccess(null);

    // Validation
    if (hours <= 0) {
      setBookingError('End time must be later than start time.');
      return;
    }

    if (hours < resource.min_duration_hours) {
      setBookingError(`Minimum booking duration is ${resource.min_duration_hours} hour(s).`);
      return;
    }

    if (hours > resource.max_duration_hours) {
      setBookingError(`Maximum booking duration is ${resource.max_duration_hours} hour(s).`);
      return;
    }

    if (!purpose.trim()) {
      setBookingError('Please enter your project or research purpose.');
      return;
    }

    try {
      setSubmitting(true);
      const startDateTime = new Date(`${bookingDate}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${bookingDate}T${endTime}:00`).toISOString();

      const res = await api.post('/bookings', {
        resource_id: resource.id,
        start_time: startDateTime,
        end_time: endDateTime,
        purpose: purpose.trim(),
        attendees_count: attendeesCount,
      });

      if (res.data.success) {
        setBookingSuccess(res.data.data);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to submit booking request. Please check availability.');
    } finally {
      setSubmitting(false);
    }
  };

  const image = resource.primary_image || resource.image_url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/resources" className="hover:text-slate-800 transition">Resources</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{resource.title}</span>
      </nav>

      {/* Main Grid: Left Details + Right Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media & Specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Visual */}
          <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-sm border border-slate-200">
            <img
              src={image}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 shadow-sm backdrop-blur-sm">
                {resource.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-900 text-white shadow-sm backdrop-blur-sm capitalize">
                {resource.type}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/70 text-white backdrop-blur-md">
                Managed by Dr. Sarah Jenkins
              </span>
            </div>
          </div>

          {/* Title & Metadata Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {resource.title}
              </h1>
              <button
                type="button"
                onClick={() => setVisitModalOpen(true)}
                className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-brand-900 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition flex items-center space-x-1.5 shadow-sm"
              >
                <Calendar className="w-4 h-4 text-brand-700" />
                <span>Request Physical Visit</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{resource.location}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-brand-600" />
                <span>Capacity: {resource.capacity || 1} Person{resource.capacity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Duration: {resource.min_duration_hours} – {resource.max_duration_hours} hrs</span>
              </div>
            </div>

            {/* Free Physical Inspection Banner */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-xs text-emerald-950">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Pre-Reservation Physical Inspection Included</strong>
                <span>You can schedule an on-site visit to inspect the equipment and test compatibility before committing to a paid booking. No advance deposit is charged for physical visits.</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Resource Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {resource.description}
              </p>
            </div>
          </div>

          {/* Safety & Protocol Instructions */}
          {(resource.safety_instructions || resource.booking_rules) && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              {resource.safety_instructions && (
                <div>
                  <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm mb-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Safety Protocols & Guidelines</span>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200/70 p-4 rounded-2xl text-xs text-amber-900 leading-relaxed">
                    {resource.safety_instructions}
                  </div>
                </div>
              )}

              {resource.booking_rules && (
                <div>
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
                    <FileText className="w-4 h-4 text-brand-700" />
                    <span>Usage Rules & Lab Policies</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 leading-relaxed">
                    {resource.booking_rules}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Owner & Department Badge */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-800">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Managed by</p>
                <h4 className="text-base font-bold text-slate-900">{resource.owner_name || 'Dr. Sarah Jenkins'}</h4>
                <p className="text-xs text-slate-500">Nanotechnology & Materials Characterization Lab</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Verified Host
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/50 space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Access Rate</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {Number(resource.fee_per_hour) === 0 ? 'Free' : `₹${Number(resource.fee_per_hour).toLocaleString('en-IN')}`}
                </span>
                {Number(resource.fee_per_hour) > 0 && (
                  <span className="text-xs text-slate-500 font-medium">/ hour</span>
                )}
              </div>
              {Number(resource.fee_per_hour) > 0 && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  50% advance due upon booking; remaining 50% due at usage handover.
                </p>
              )}
            </div>

            {/* Quick action: Request Visit first */}
            <button
              type="button"
              onClick={() => setVisitModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-brand-900 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4 text-brand-700" />
              <span>Inspect First (Free Physical Visit)</span>
            </button>

            {/* Success Notification Alert */}
            {bookingSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Request Created!</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Booking <strong>#{bookingSuccess.id}</strong> reserved. {Number(bookingSuccess.total_amount) > 0 ? `Please verify the 50% advance (₹${bookingSuccess.advance_amount.toLocaleString('en-IN')}) to lock your slot.` : 'Reservation confirmed.'}
                </p>
                <Link
                  to={`/my-bookings/${bookingSuccess.id}`}
                  className="inline-block mt-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                >
                  View Reservation & Pay Advance →
                </Link>
              </div>
            )}

            {bookingError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-800 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {!bookingSuccess && (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* Date Picker */}
                <div>
                  <label htmlFor="booking-date" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Reservation Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="booking-start-time" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Start Time
                    </label>
                    <input
                      id="booking-start-time"
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="booking-end-time" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      End Time
                    </label>
                    <input
                      id="booking-end-time"
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Time Zone: <strong>Campus Local Time (IST / Eastern)</strong></span>
                </div>

                {/* Purpose */}
                <div>
                  <label htmlFor="booking-purpose" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Research / Project Purpose
                  </label>
                  <textarea
                    id="booking-purpose"
                    rows={2}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Briefly state your experimental objective or project purpose..."
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
                  />
                </div>

                {/* Number of Attendees */}
                <div>
                  <label htmlFor="booking-attendees" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Attendees / Team Size
                  </label>
                  <input
                    id="booking-attendees"
                    type="number"
                    min="1"
                    max={resource.capacity || 10}
                    value={attendeesCount}
                    onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-700 focus:outline-none transition"
                  />
                </div>

                {/* 50/50 Price Breakdown Calculation */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Duration:</span>
                    <span className="font-semibold text-slate-900">{hours} hour(s)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Agreed Total Price:</span>
                    <span className="font-bold text-slate-900">
                      {Number(total) === 0 ? 'Free (₹0.00)' : `₹${total.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  {Number(total) > 0 && (
                    <>
                      <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200/70">
                        <span>Advance Due to Confirm (50%):</span>
                        <span>₹{advance.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Remaining Due at Handover (50%):</span>
                        <span>₹{remaining.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200/70">
                    <span>Approval Process:</span>
                    <span className="font-medium text-slate-700">
                      {resource.requires_approval ? 'Lab Director Review' : 'Instant Confirmation'}
                    </span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-900 hover:bg-brand-800 transition shadow-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-700 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Validating Slot...'
                      : user
                      ? Number(total) > 0
                        ? `Reserve & Pay 50% Advance (₹${advance.toLocaleString('en-IN')})`
                        : 'Submit Booking Request'
                      : 'Sign In to Reserve'}
                  </span>
                </button>

                {/* Clear Policies Accordion / Info Card */}
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 space-y-1.5">
                    <p className="font-semibold text-slate-800">📋 50/50 Reservation Schedule:</p>
                    <p className="text-slate-600 leading-relaxed">
                      1. Slot is held upon submitting request.<br />
                      2. Pay <strong>50% advance</strong> to lock the slot.<br />
                      3. Owner confirms facility preparation.<br />
                      4. Inspect and start usage; remaining 50% settled upon handover.
                    </p>
                    <p className="font-semibold text-slate-800 pt-1">🔄 Cancellation & Refund Rules:</p>
                    <p className="text-slate-600 leading-relaxed">
                      • <strong>&gt; 24h prior:</strong> 100% advance refund.<br />
                      • <strong>2 – 24h prior:</strong> 50% advance refund.<br />
                      • <strong>&lt; 2h prior:</strong> Non-refundable.
                    </p>
                  </div>
                </div>
              </form>
            )}

            <div className="text-center">
              <span className="text-[11px] text-slate-400">
                Protected by ShareSphere double-booking prevention engine.
              </span>
            </div>
          </div>
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
