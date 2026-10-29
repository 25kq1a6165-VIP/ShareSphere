import React, { useState } from 'react';
import api from '../../services/api';
import {
  X,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Receipt,
  FileCheck,
  Zap,
  Info
} from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  isRemaining = false,
  onPaymentSuccess
}) {
  const [paymentMethod, setPaymentMethod] = useState('UPI / NetBanking');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const totalAmount = Number(booking.total_amount || 0);
  const advanceAmount = Number(booking.advance_amount || Math.round(totalAmount * 50) / 100);
  const remainingAmount = Number(booking.remaining_amount || Math.round((totalAmount - advanceAmount) * 100) / 100);

  const amountDueNow = isRemaining ? remainingAmount : advanceAmount;
  const balanceDueLater = isRemaining ? 0 : remainingAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!agreedTerms) {
      setError('You must confirm acceptance of the booking terms and cancellation rules to proceed.');
      return;
    }

    setProcessing(true);
    try {
      const endpoint = isRemaining ? '/payments/remaining' : '/payments/advance';
      const res = await api.post(endpoint, {
        booking_id: booking.id,
        payment_method: paymentMethod,
        simulate_failure: simulateFailure,
        gateway: 'ShareSphere Verified Test Gateway',
      });

      if (res.data.success) {
        if (onPaymentSuccess) {
          onPaymentSuccess(res.data.data);
        }
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed. Please check your payment details or test mode settings.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close payment modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Test Mode Banner */}
        <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-2.5 px-3 flex items-center justify-between text-xs text-amber-900 font-medium">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span><strong>Sandbox Mode:</strong> Verified Test Payment Gateway</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
            Dev Testnet
          </span>
        </div>

        {/* Modal Header */}
        <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
          <Lock className="w-4 h-4" />
          <span>{isRemaining ? 'Final 50% Settlement' : '50% Advance Commitment'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          {isRemaining ? 'Pay Remaining Balance' : 'Confirm & Pay 50% Advance'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Reservation #{booking.id} — <strong className="text-slate-800">{booking.resource_title}</strong>
        </p>

        {/* Transparent 50/50 Price Breakdown */}
        <div className="my-5 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Agreed Total Rental Price:</span>
            <span className="font-semibold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Applicable Taxes & Campus Fees:</span>
            <span className="font-semibold text-slate-500">₹0 (Academic Exemption)</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total Payable:</span>
            <span className="font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span className="font-bold text-brand-900">
              {isRemaining ? 'Remaining Due Now (50%):' : 'Advance Due Now (50%):'}
            </span>
            <span className="text-xl font-extrabold text-emerald-700">
              ₹{amountDueNow.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>{isRemaining ? 'Advance Previously Settled:' : 'Remaining Balance (Due upon handover):'}</span>
            <span className="font-semibold text-slate-700">
              ₹{isRemaining ? advanceAmount.toLocaleString('en-IN') : balanceDueLater.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI / NetBanking', label: 'UPI / NetBank', icon: '📱' },
                { id: 'Card / Debit', label: 'Credit Card', icon: '💳' },
                { id: 'Campus Grant Wallet', label: 'Grant Wallet', icon: '🏛️' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === m.id
                      ? 'border-brand-700 bg-brand-50/70 text-brand-950 font-bold ring-2 ring-brand-700/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-[11px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Test Gateways Failure Simulation Option */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex items-center justify-between">
            <div className="text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block">Simulate Gateway Decline?</span>
              <span>Test application handling of failed/declined transactions</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="flex items-start space-x-2 pt-1">
            <input
              id="payment-terms"
              type="checkbox"
              required
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded text-brand-900 focus:ring-brand-700 border-slate-300"
            />
            <label htmlFor="payment-terms" className="text-[11px] text-slate-600 leading-tight">
              I agree to the <strong>Cancellation & Refund Rules</strong>: 100% refund for cancellations &gt; 24h prior, 50% for 2–24h prior, and 0% for &lt; 2h prior to scheduled session.
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={processing || !agreedTerms}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>
                {processing
                  ? 'Verifying Signature with Backend...'
                  : `Authorize & Pay ₹${amountDueNow.toLocaleString('en-IN')}`}
              </span>
            </button>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-400">
              Verified 256-bit SSL Gateway. Signature and transaction verified server-side.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

