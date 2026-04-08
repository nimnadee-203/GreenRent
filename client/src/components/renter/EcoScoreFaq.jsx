import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function EcoScoreFaq() {
  return (
    <div className="bg-slate-900 rounded-2xl p-12 text-white">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
        <HelpCircle className="w-6 h-6 text-emerald-400" />
        Frequently Asked Questions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
        <div>
          <h4 className="font-semibold text-emerald-400 mb-3 text-lg">Who verifies these scores?</h4>
          <p className="text-slate-400 leading-relaxed">
            Initial scores are based on landlord data, but they are audited through renter reviews and environment sensor data (like AQI) monitored through our real-time integrations.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-emerald-400 mb-3 text-lg">Can a score change?</h4>
          <p className="text-slate-400 leading-relaxed">
            Yes! If a landlord installs solar panels or upgrades home insulation, the score is updated immediately upon verification.
          </p>
        </div>
      </div>
    </div>
  );
}
