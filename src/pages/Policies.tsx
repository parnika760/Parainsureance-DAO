/*
  COMPONENT: PoliciesPage
  DESCRIPTION: A dashboard page for users to view their active insurance policies and purchase new ones.
  
  FEATURES:
  1. Display active policies
  2. Browse and purchase new weather-related farm policies
  3. Policy details modal when clicking purchase
  4. Confirmation dialog before finalizing purchase
  5. Weather trigger information for automatic payouts
*/

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, ArrowRight, X, Cloud, Droplets, Wind, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { useWeb3 } from '../context/Web3Context';
import { contractService } from '../services/contractService';
import { transactionService } from '../services/transactionService';

interface AvailablePolicy {
  id: string;
  name: string;
  type: string;
  description: string;
  coverage: string;
  premium: string;
  icon: string;
  trigger: string;
  triggerCondition: string;
  payoutTiming: string;
  claimExample: string;
}

interface UserPolicy {
  id: string;
  type: string;
  coverage: string;
  duration: number;
  status: string;
  startDate: string;
  endDate: string;
  txHash?: string;
  amount?: string;
}

export const Policies = () => {
  const { account, signer, isConnected, provider } = useWeb3();
  const [activePolicies, setActivePolicies] = useState<UserPolicy[]>([]);
  const [hasPolicy, setHasPolicy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);

  // Load purchased policies when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      loadPurchasedPolicies();
    } else {
      setActivePolicies([]);
      setHasPolicy(false);
    }
  }, [isConnected, account]);

  const loadPurchasedPolicies = () => {
    try {
      setIsLoadingPolicies(true);
      transactionService.loadFromStorage();
      const policyTransactions = transactionService.getTransactionsByType('PolicyBought');
      
      if (policyTransactions.length > 0) {
        const policies: UserPolicy[] = policyTransactions.map((tx, index) => ({
          id: `#${8821 + index}`,
          type: 'Weather Protection Policy',
          coverage: '0.01 ETH',
          duration: Math.floor(Math.random() * 100),
          status: tx.status === 'confirmed' ? 'Active & Monitoring' : 'Pending',
          startDate: new Date(tx.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          endDate: new Date(tx.timestamp + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          txHash: tx.txHash,
          amount: tx.amount
        }));
        setActivePolicies(policies);
        setHasPolicy(true);
      } else {
        setActivePolicies([]);
        setHasPolicy(false);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      setActivePolicies([]);
      setHasPolicy(false);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  const [availablePolicies] = useState<AvailablePolicy[]>([
    {
      id: 'POL001',
      name: 'Excessive Rainfall Protection',
      type: 'Flood & Water Damage',
      description: 'Protection against excessive rainfall that causes flooding and water damage to crops.',
      coverage: '3.5 ETH',
      premium: '0.35 ETH',
      icon: '💧',
      trigger: 'Rainfall exceeds 120mm in 24 hours',
      triggerCondition: 'Rainfall > 120mm within 24-hour period',
      payoutTiming: 'Automatic payout within 2 hours of trigger detection',
      claimExample: 'If 135mm rainfall is recorded, policy automatically triggers and compensates for water damage.'
    },
    {
      id: 'POL002',
      name: 'Extreme Heat Wave Protection',
      type: 'Extreme Temperature',
      description: 'Coverage for crop damage from extreme heat waves and temperature spikes.',
      coverage: '4.0 ETH',
      premium: '0.40 ETH',
      icon: '🌡️',
      trigger: 'Temperature exceeds 42°C for 3+ consecutive days',
      triggerCondition: 'Daily max temperature > 42°C for 3+ days in a row',
      payoutTiming: 'Automatic payout within 4 hours of third consecutive day trigger',
      claimExample: 'If temperature stays above 42°C for 3 days straight, compensation is paid for heat-stressed crops.'
    },
    {
      id: 'POL003',
      name: 'Hailstorm & Storm Damage',
      type: 'Severe Weather Events',
      description: 'Protection against hail damage, lightning strikes, and severe wind storms.',
      coverage: '5.5 ETH',
      premium: '0.55 ETH',
      icon: '⛈️',
      trigger: 'Hail accumulation > 25mm or wind speed > 80 km/h',
      triggerCondition: 'Hail > 25mm or Sustained winds > 80 km/h',
      payoutTiming: 'Immediate payout within 1 hour of event detection',
      claimExample: 'A hailstorm producing 30mm of hail triggers immediate compensation for crop damage.'
    },
    {
      id: 'POL004',
      name: 'Severe Drought Coverage',
      type: 'Drought Protection',
      description: 'Protection against prolonged droughts with cumulative low rainfall.',
      coverage: '4.5 ETH',
      premium: '0.45 ETH',
      icon: '☀️',
      trigger: 'Cumulative rainfall < 50mm in 30 days',
      triggerCondition: 'Monthly rainfall total < 50mm (below minimum threshold)',
      payoutTiming: 'Payout triggered on final day of month if condition met',
      claimExample: 'If total rainfall for the month remains below 50mm, compensation is paid for drought damage.'
    },
    {
      id: 'POL005',
      name: 'Frost & Freeze Damage Protection',
      type: 'Frost Damage',
      description: 'Coverage for frost and freeze events that damage crops and buds.',
      coverage: '3.8 ETH',
      premium: '0.38 ETH',
      icon: '❄️',
      trigger: 'Temperature drops below 0°C during growing season',
      triggerCondition: 'Minimum daily temperature < 0°C during frost-sensitive period',
      payoutTiming: 'Automatic payout within 2 hours of frost event detection',
      claimExample: 'A sudden frost bringing temperature to -2°C triggers compensation for frost-damaged buds and shoots.'
    },
    {
      id: 'POL006',
      name: 'Combined Weather Events',
      type: 'Multi-Hazard Protection',
      description: 'Comprehensive coverage for multiple weather-related risks combined.',
      coverage: '7.0 ETH',
      premium: '0.60 ETH',
      icon: '🌪️',
      trigger: 'Multiple weather events: (Rain > 100mm AND Temp > 38°C) OR (Wind > 70 km/h)',
      triggerCondition: 'Combined weather thresholds met within 48-hour window',
      payoutTiming: 'Automatic payout within 3 hours of multi-event detection',
      claimExample: 'Heavy rainfall combined with extreme heat triggers comprehensive damage compensation.'
    }
  ]);

  const [selectedPolicy, setSelectedPolicy] = useState<AvailablePolicy | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePurchaseClick = (policy: AvailablePolicy) => {
    if (!isConnected || !account) {
      alert('⚠️ You need to connect your wallet first to purchase a policy.');
      return;
    }
    setSelectedPolicy(policy);
  };

  const handleConfirmPurchase = async () => {
    // First, validate wallet connection
    if (!isConnected || !account) {
      alert('❌ You need to connect your wallet first to purchase a policy.');
      setShowConfirmation(false);
      return;
    }

    if (!signer) {
      alert('❌ Wallet is not properly initialized. Please reconnect your wallet and try again.');
      setShowConfirmation(false);
      return;
    }

    if (!provider) {
      alert('❌ Provider is not initialized. Please reload the page and connect your wallet again.');
      setShowConfirmation(false);
      return;
    }

    if (!selectedPolicy) {
      alert('❌ No policy selected. Please try again.');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Ensure contractService has provider and signer set
      contractService.setProvider(provider);
      contractService.setSigner(signer);
      
      // Request policy through contract service
      // This will trigger MetaMask to sign the transaction
      const defaultLocation = 'Farm Location';
      const txHash = await contractService.requestPolicy(defaultLocation);
      
      // Success - show confirmation
      alert(`✅ Policy ${selectedPolicy.name} purchased successfully!\n\nTransaction Hash: ${txHash}\n\nPremium of ${selectedPolicy.premium} has been deducted from your wallet.`);
      setSelectedPolicy(null);
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error purchasing policy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if error is due to wallet not being connected
      if (errorMessage.includes('Signer not set') || errorMessage.includes('not connected')) {
        alert('❌ Your wallet is not connected properly. Please:\n1. Make sure MetaMask is unlocked\n2. Reload the page\n3. Connect your wallet again\n4. Try purchasing again');
      } else if (errorMessage.includes('Wrong network') || errorMessage.includes('Sepolia')) {
        alert(`🔗 NETWORK ERROR:\n\n${errorMessage}\n\nSteps to fix:\n1. Open MetaMask\n2. Click network dropdown (top)\n3. Select "Sepolia" testnet\n4. Try purchasing again`);
      } else if (errorMessage.includes('Contract not found') || errorMessage.includes('Contract not deployed')) {
        alert(`❌ Contract Deployment Error:\n\n${errorMessage}\n\nPlease contact support if the issue persists.`);
      } else if (errorMessage.includes('Contract interface mismatch')) {
        alert(`❌ ${errorMessage}\n\nPlease ensure you are on the Sepolia Testnet and try again.`);
      } else if (errorMessage.includes('Insufficient ETH') || errorMessage.includes('insufficient')) {
        alert('❌ Not Enough ETH\n\nYou have insufficient ETH to cover:\n- Policy premium (0.01 ETH)\n- Gas fees\n\nPlease add more ETH to your wallet and try again.');
      } else if (errorMessage.includes('rejected')) {
        alert('⚠️ Transaction Cancelled\n\nYou rejected the transaction in MetaMask. No funds were deducted.');
      } else {
        alert(`❌ Failed to purchase policy.\n\nError: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedPolicy(null);
    setShowConfirmation(false);
  };

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
            Manage your active coverage and explore new weather protection policies
          </p>
        </div>

        {/* Active Policies Section */}
        {!isConnected ? (
          <div className="mb-16">
            <div className="glass-card border border-blue-400 border-opacity-30 p-8 text-center">
              <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet to View Policies</h2>
              <p className="text-gray-300">Please connect your wallet to view your purchased policies</p>
            </div>
          </div>
        ) : hasPolicy ? (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              Your Active Policies ({activePolicies.length})
            </h2>
            <div className="space-y-6">
              {activePolicies.map((policy, index) => (
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
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${policy.status === 'Active & Monitoring' ? 'bg-emerald-500 bg-opacity-20' : 'bg-yellow-500 bg-opacity-20'}`}>
                      <CheckCircle className={`w-5 h-5 ${policy.status === 'Active & Monitoring' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                      <span className={`font-semibold ${policy.status === 'Active & Monitoring' ? 'text-emerald-400' : 'text-yellow-400'}`}>{policy.status}</span>
                    </div>
                  </div>

                  {/* Policy Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-emerald-400 border-opacity-20">
                    <div>
                      <p className="stat-label">Coverage Type</p>
                      <p className="text-xl font-semibold text-white mt-2">{policy.type}</p>
                    </div>
                    <div>
                      <p className="stat-label">Premium Paid</p>
                      <p className="text-xl font-semibold text-emerald-400 mt-2">{policy.amount || '0.01 ETH'}</p>
                    </div>
                    <div>
                      <p className="stat-label\">Policy Duration</p>
                      <p className="text-sm text-gray-300 mt-2">
                        {policy.startDate} → {policy.endDate}
                      </p>
                    </div>
                  </div>

                  {/* Transaction Info */}
                  {policy.txHash && (
                    <div className="mb-6 p-3 bg-blue-500 bg-opacity-10 rounded-lg border border-blue-400 border-opacity-20">
                      <p className="text-xs text-blue-300 font-semibold mb-1">Transaction Hash:</p>
                      <p className="text-xs text-gray-300 font-mono break-all">{policy.txHash}</p>
                    </div>
                  )}

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
            </div>
          </div>
        ) : (
          <div className="mb-16">
            <div className="glass-card border border-yellow-400 border-opacity-30 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Active Policies</h2>
              <p className="text-gray-300 mb-6">You haven't purchased any policies yet. Browse our available policies below to get started.</p>
            </div>
          </div>
        )}

        {/* Available Policies Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            Available Weather Protection Policies
          </h2>
          <p className="text-gray-300 mb-8">
            Choose from our comprehensive weather insurance policies. Each policy automatically triggers payouts based on weather conditions from our oracle network.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePolicies.map((policy) => (
              <div
                key={policy.id}
                className="glass-card border border-blue-400 border-opacity-30 hover:border-opacity-100 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{policy.icon}</div>
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-300 rounded-full">
                    {policy.type}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-2">{policy.name}</h3>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4">{policy.description}</p>

                {/* Coverage & Premium */}
                <div className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Coverage</p>
                    <p className="text-lg font-bold text-emerald-400">{policy.coverage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Premium</p>
                    <p className="text-lg font-bold text-white">{policy.premium}</p>
                  </div>
                </div>

                {/* Quick Trigger Info */}
                <div className="mb-6 p-3 bg-blue-500 bg-opacity-10 rounded-lg border border-blue-400 border-opacity-20">
                  <p className="text-xs text-blue-300 font-semibold mb-2">AUTO-TRIGGER CONDITION:</p>
                  <p className="text-sm text-gray-200">{policy.triggerCondition}</p>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchaseClick(policy)}
                  disabled={!isConnected}
                  className={`btn-primary !w-full !py-2 mt-auto ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={!isConnected ? 'Connect your wallet to purchase' : 'Click to purchase this policy'}
                >
                  {isConnected ? 'Purchase Policy' : 'Connect Wallet to Purchase'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Policy Details Modal */}
      {selectedPolicy && !showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="glass-card border border-blue-400 border-opacity-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedPolicy.icon}</div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedPolicy.name}</h2>
                  <p className="text-gray-400 mt-1">{selectedPolicy.type}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{selectedPolicy.description}</p>
              </div>

              {/* Coverage Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-500 bg-opacity-10 rounded-lg border border-emerald-400 border-opacity-30">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Maximum Coverage</p>
                  <p className="text-2xl font-bold text-emerald-400">{selectedPolicy.coverage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Premium Cost</p>
                  <p className="text-2xl font-bold text-white">{selectedPolicy.premium}</p>
                </div>
              </div>

              {/* Auto-Trigger Information */}
              <div className="border border-blue-400 border-opacity-30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Automatic Payout Trigger
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Weather Condition:</p>
                    <p className="text-white font-semibold">{selectedPolicy.trigger}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Specific Trigger Threshold:</p>
                    <p className="text-blue-300 font-mono text-sm bg-dark-900 p-2 rounded">{selectedPolicy.triggerCondition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Payout Timing:</p>
                    <p className="text-emerald-400 font-semibold">{selectedPolicy.payoutTiming}</p>
                  </div>
                </div>
              </div>

              {/* Real-World Example */}
              <div className="border border-purple-400 border-opacity-30 rounded-lg p-4 bg-purple-500 bg-opacity-5">
                <h3 className="text-lg font-bold text-purple-300 mb-3">Example Scenario</h3>
                <p className="text-gray-300">{selectedPolicy.claimExample}</p>
              </div>

              {/* How It Works */}
              <div className="bg-dark-800 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-3">How It Works</h3>
                <ol className="space-y-2 text-gray-300 text-sm">
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold flex-shrink-0">1.</span>
                    <span>Purchase the policy by paying the premium in ETH</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold flex-shrink-0">2.</span>
                    <span>Our oracle network continuously monitors weather data</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold flex-shrink-0">3.</span>
                    <span>When weather conditions trigger the payout threshold, compensation is automatically disbursed</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-400 font-bold flex-shrink-0">4.</span>
                    <span>No claims needed - fully automated based on weather data</span>
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-700">
                <button
                  onClick={closeModal}
                  className="flex-1 btn-secondary !py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="flex-1 btn-primary !py-3"
                >
                  Proceed to Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {selectedPolicy && showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="glass-card border-2 border-yellow-400 border-opacity-50 max-w-md w-full">
            {/* Confirmation Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white">Confirm Purchase</h2>
            </div>

            {/* Confirmation Content */}
            <div className="mb-8 p-4 bg-dark-800 rounded-lg border border-gray-700">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Policy:</span>
                  <span className="text-white font-semibold">{selectedPolicy.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Coverage:</span>
                  <span className="text-emerald-400 font-bold">{selectedPolicy.coverage}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                  <span className="text-gray-400 font-semibold">Premium to Pay:</span>
                  <span className="text-white text-xl font-bold">{selectedPolicy.premium}</span>
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            <p className="text-gray-300 text-center mb-8 leading-relaxed">
              Are you sure you want to purchase the <span className="font-semibold text-white">{selectedPolicy.name}</span> policy? 
              You will be charged <span className="font-bold text-emerald-400">{selectedPolicy.premium}</span> from your wallet.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 btn-secondary !py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={isProcessing || !isConnected}
                className="flex-1 btn-primary !py-3 !bg-emerald-600 hover:!bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Yes, Purchase Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
