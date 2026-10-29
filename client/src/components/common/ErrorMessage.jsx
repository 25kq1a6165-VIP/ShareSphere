import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message = 'An error occurred while loading data.', onRetry }) {
  return (
    <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 my-4 flex items-start space-x-3">
      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-100 px-3 py-1.5 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
