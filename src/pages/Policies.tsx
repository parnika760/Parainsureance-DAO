/*
  COMPONENT: PoliciesPage
  DESCRIPTION: A dashboard page for users to view their active insurance policies.
  
  REQUIREMENTS:
  1. Use 'lucide-react' for icons (Shield, AlertTriangle, CheckCircle).
  2. STATE: Use a mock variable 'hasPolicy' = true to demonstrate the UI.
  3. UI (Active State):
     - Show a Glassmorphism card with a glowing green border.
     - Content: "Policy #8821", "Type: Drought Protection", "Coverage: 5.0 ETH".
     - A progress bar titled "Policy Duration" (filled 40%).
     - A status badge that says "Active & Monitoring" in emerald green.
  4. UI (Empty State):
     - If 'hasPolicy' is false, show a centered message: "No active protection found" with a "Buy Policy" button.
  5. STYLE: Dark mode, Tailwind CSS, using emerald-500 for accents.
*/

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';

export const Policies = () => {
  const [hasPolicy] = useState(true);
  const [policies] = useState([
    {
      id: '#8821',
      type: 'Drought Protection',
      coverage: '5.0 ETH',
      duration: 40,
      status: 'Active & Monitoring',
      startDate: 'Jan 15, 2026',
      endDate: 'Jan 15, 2027'
    }
  ]);

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Policies
          </h1>
          <p className="text-gray-300 text-lg">
            Manage and monitor your active insurance coverage
          </p>
        </div>

        {hasPolicy ? (
          <div className="space-y-6">
            {policies.map((policy, index) => (
              <div
                key={index}
                className="glass-card border-2 border-emerald-400 border-opacity-50 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300"
              >
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-lg">
                      <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Policy ID</p>
                      <h2 className="text-2xl font-bold text-white">{policy.id}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500 bg-opacity-20 px-4 py-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">{policy.status}</span>
                  </div>
                </div>

                {/* Policy Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-emerald-400 border-opacity-20">
                  <div>
                    <p className="stat-label">Coverage Type</p>
                    <p className="text-xl font-semibold text-white mt-2">{policy.type}</p>
                  </div>
                  <div>
                    <p className="stat-label">Maximum Coverage</p>
                    <p className="text-xl font-semibold text-emerald-400 mt-2">{policy.coverage}</p>
                  </div>
                  <div>
                    <p className="stat-label">Policy Duration</p>
                    <p className="text-sm text-gray-300 mt-2">
                      {policy.startDate} → {policy.endDate}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="stat-label">Coverage Progress</p>
                    <span className="text-emerald-400 font-semibold">{policy.duration}%</span>
                  </div>
                  <div className="w-full bg-dark-800 rounded-full h-3 overflow-hidden border border-emerald-400 border-opacity-20">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${policy.duration}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-3">
                  <button className="flex-1 btn-primary !py-2">
                    View Claims
                  </button>
                  <button className="flex-1 btn-secondary !py-2">
                    Policy Details
                  </button>
                </div>
              </div>
            ))}

            {/* Additional Info Card */}
            <div className="glass-card border border-blue-400 border-opacity-20">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Need to adjust your coverage?
                  </h3>
                  <p className="text-gray-300 mb-4">
                    You can upgrade or modify your policy anytime. Contact our support team for personalized assistance.
                  </p>
                  <button className="btn-secondary !w-auto !py-2 px-6 inline-flex items-center gap-2">
                    Get Support <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-emerald-400 text-6xl mb-6">🛡️</div>
            <h2 className="text-3xl font-bold text-white mb-3">No active protection found</h2>
            <p className="text-gray-400 text-center mb-8 max-w-md">
              You don't have any active insurance policies yet. Start protecting your crops today with our parametric insurance.
            </p>
            <button className="btn-primary !w-auto !px-8 inline-flex items-center gap-2">
              Buy Policy <ArrowRight size={20} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
