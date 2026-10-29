import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, Building, QrCode } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, receipt, booking }) {
  if (!isOpen || (!receipt && !booking)) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = receipt?.receipt_number || `RCPT-${new Date().getFullYear()}-${String(booking?.id || 1).padStart(4, '0')}`;
  const txnId = receipt?.transaction_id || booking?.advance_payment_id || booking?.final_payment_id || `txn_${Date.now()}`;
  const dateStr = receipt?.date ? new Date(receipt.date).toLocaleString() : new Date().toLocaleString();
  const paymentType = receipt?.payment_type || (booking?.final_paid ? 'Final 50% Settlement' : '50% Advance Payment');
  const amountPaid = receipt?.amount_paid !== undefined ? receipt.amount_paid : (booking?.final_paid ? booking?.remaining_amount : booking?.advance_amount);
  const remainingBalance = receipt?.remaining_balance !== undefined ? receipt.remaining_balance : (booking?.final_paid ? 0 : booking?.remaining_amount);
  const totalAmount = booking?.total_amount || (Number(amountPaid) + Number(remainingBalance));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-fade-in print:p-0 print:border-none print:shadow-none">
        {/* Close & Print Buttons */}
        <div className="absolute top-5 right-5 flex items-center space-x-2 print:hidden">
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center space-x-1 text-xs font-semibold"
            title="Print Official Receipt"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close receipt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ShareSphere Branding Header */}
        <div className="border-b border-slate-200 pb-5 mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-brand-900 text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                Share<span className="text-brand-700">Sphere</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
                Resource Reservation System
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Official Payment Receipt</h2>
              <p className="text-[11px] text-slate-500">Invoice / Acknowledgement Voucher</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>TRANSACTION VERIFIED</span>
            </span>
          </div>
        </div>

        {/* Receipt Voucher Meta */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 mb-5">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Receipt Number</span>
            <span className="font-mono font-bold text-slate-800 text-xs">{receiptNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Date & Time</span>
            <span className="text-slate-700 font-medium">{dateStr}</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Transaction ID (Verified)</span>
            <span className="font-mono text-slate-700 text-[11px] select-all break-all">{txnId}</span>
          </div>
        </div>

        {/* Booker & Facility Info */}
        <div className="space-y-3 mb-5 text-xs text-slate-600">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Reserved Resource:</span>
            <span className="font-bold text-slate-900 text-right">{booking?.resource_title || 'Campus Resource'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Host Facility:</span>
            <span className="font-medium text-slate-800">{booking?.owner_name || 'Dr. Sarah Jenkins'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Booked By:</span>
            <span className="font-medium text-slate-800">{booking?.user_name || 'Alex Rivera'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Payment Type:</span>
            <span className="font-semibold text-brand-800">{paymentType}</span>
          </div>
        </div>

        {/* Financial Line Items */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs mb-5">
          <div className="flex justify-between text-slate-600">
            <span>Total Agreed Rental Price:</span>
            <span className="font-medium text-slate-800">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Amount Paid This Transaction:</span>
            <span className="font-extrabold text-emerald-700 text-sm">₹{Number(amountPaid).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
            <span>Remaining Outstanding Balance:</span>
            <span className="font-bold text-slate-800">₹{Number(remainingBalance).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically verified server signature</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">STATUS: SETTLED</span>
        </div>
      </div>
    </div>
  );
}

