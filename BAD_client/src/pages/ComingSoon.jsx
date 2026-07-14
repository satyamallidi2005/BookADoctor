import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Reusable placeholder view for features slated for the next development phase.
 */
const ComingSoon = ({ title }) => {
  return (
    <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-100 shadow-md text-center max-w-md mx-auto mt-12 space-y-4 animate-fadeIn">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
        <Clock className="w-8 h-8 animate-pulse" />
      </div>
      <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{title || 'Feature'}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">
        This page is currently under construction. Full workflow implementation for this module belongs to the upcoming development phase.
      </p>
    </div>
  );
};

export default ComingSoon;
