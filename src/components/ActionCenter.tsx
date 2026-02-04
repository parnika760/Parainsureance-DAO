import { ShoppingCart, AlertTriangle, DollarSign, CheckCircle, Clock, Zap, Key, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { contractService } from '../services/contractService';
import { oracleService } from '../services/oracleService';
import { transactionService } from '../services/transactionService';
import { LocationContext } from './StatsOverview';
import { aiPremiumService, PremiumCalculationResult } from '../services/aiPremiumService';
import { geminiAIService, AIRiskAssessment } from '../services/geminiAIService';

interface ClaimInfo {
  id: string;
  name: string;
  amount: string;
  date: string;
  status: 'claimed' | 'pending';
}

const WEATHER_TYPES = [
  { value: 'Drought', label: '🏜️ Drought' },
  { value: 'ExcessiveRainfall', label: '🌧️ Excessive Rainfall' },
  { value: 'HeatWave', label: '🌡️ Heat Wave' },
  { value: 'Hailstorm', label: '🌨️ Hailstorm' },
  { value: 'Frost', label: '❄️ Frost' },
  { value: 'MultiHazard', label: '⚡ Multi-Hazard' },
];

export const ActionCenter = () => {
  const { isConnected } = useWeb3();
  const [policyLoading, setPolicyLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [weatherType, setWeatherType] = useState('Drought');
  const [policyActive, setPolicyActive] = useState(false);
  const [fundAmount, setFundAmount] = useState('0.5');
  const [claimedPolicies, setClaimedPolicies] = useState<ClaimInfo[]>([]);
  const [pendingClaims, setPendingClaims] = useState<ClaimInfo[]>([]);
  
  // AI Premium state
  const [quote, setQuote] = useState<PremiumCalculationResult | null>(null);
  const [aiAssessment, setAiAssessment] = useState<AIRiskAssessment | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [useRealAI, setUseRealAI] = useState(geminiAIService.isConfigured());
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);

  // Subscribe to location changes from StatsOverview
  useEffect(() => {
    const unsubscribe = LocationContext.subscribe((newLocation, newQuote) => {
      setLocation(newLocation);
      if (newQuote) {
        // Recalculate with selected weather type
        const updatedQuote = aiPremiumService.calculatePremium({
          location: newLocation,
          weatherType: weatherType,
          baselineAmount: '0.01',
        });
        setQuote(updatedQuote);
      } else {
        setQuote(null);
      }
    });
    
    return unsubscribe;
  }, [weatherType]);

  // Recalculate when weather type changes
  useEffect(() => {
    if (location.trim().length >= 3) {
      calculatePremium();
    }
  }, [weatherType, location, useRealAI]);

  const calculatePremium = async () => {
    if (!location.trim() || location.trim().length < 3) return;
    
    setIsCalculating(true);
    setAiError(null);
    
    try {
      if (useRealAI && geminiAIService.isConfigured()) {
        // Use REAL Gemini AI
        const assessment = await geminiAIService.calculatePremium(location, weatherType);
        setAiAssessment(assessment);
        
        // Convert to quote format for compatibility
        setQuote({
          location: assessment.location,
          weatherType: weatherType,
          basePremium: '0.01',
          riskMultiplier: assessment.riskScore / 30, // Normalize
          finalPremium: (parseFloat(assessment.recommendedPremiumETH) * 1e18).toString(),
          riskFactors: assessment.riskFactors,
          confidence: assessment.confidence,
        });
      } else {
        // Use rule-based calculation (fallback)
        const result = aiPremiumService.calculatePremium({
          location: location,
          weatherType: weatherType,
          baselineAmount: '0.01',
        });
        setQuote(result);
        setAiAssessment(null);
      }
    } catch (error) {
      console.error('Error calculating premium:', error);
      setAiError((error as Error).message);
      // Fallback to rule-based
      const result = aiPremiumService.calculatePremium({
        location: location,
        weatherType: weatherType,
        baselineAmount: '0.01',
      });
      setQuote(result);
      setAiAssessment(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      geminiAIService.setApiKey(apiKeyInput.trim());
      setUseRealAI(true);
      setShowApiKeyInput(false);
      setApiKeyInput('');
      // Recalculate with AI
      if (location.trim().length >= 3) {
        calculatePremium();
      }
    }
  };

  // Load real claims when wallet connects
  useEffect(() => {
    if (isConnected) {
      loadClaimsData();
    } else {
      setClaimedPolicies([]);
      setPendingClaims([]);
    }
  }, [isConnected]);

  const loadClaimsData = () => {
    try {
      transactionService.loadFromStorage();
      
      // Get payout transactions
      const payoutTransactions = transactionService.getTransactionsByType('PayoutTriggered');
      
      const claimed: ClaimInfo[] = payoutTransactions
        .filter(tx => tx.status === 'confirmed')
        .map((tx, index) => ({
          id: `#${8821 + index}`,
          name: 'Weather Protection Policy',
          amount: tx.amount + ' ETH',
          date: new Date(tx.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          status: 'claimed' as const
        }));

      const pending: ClaimInfo[] = payoutTransactions
        .filter(tx => tx.status === 'pending')
        .map((tx, index) => ({
          id: `POL${index + 1}`,
          name: 'Weather Protection Policy',
          amount: tx.amount + ' ETH',
          date: new Date(tx.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          status: 'pending' as const
        }));

      setClaimedPolicies(claimed);
      setPendingClaims(pending);
    } catch (error) {
      console.error('Error loading claims:', error);
      setClaimedPolicies([]);
      setPendingClaims([]);
    }
  };

  useEffect(() => {
    const checkPolicyStatus = async () => {
      if (!isConnected) return;
      try {
        const status = await contractService.getPolicyStatus();
        setPolicyActive(status.policyActive);
      } catch (error) {
        console.log('No active policy');
      }
    };

    if (isConnected) {
      checkPolicyStatus();
    }
  }, [isConnected]);

  const handleBuyPolicy = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!location.trim()) {
      alert('Please enter a farm location');
      return;
    }

    try {
      setPolicyLoading(true);
      
      // Log transaction start
      transactionService.logTransaction({
        type: 'PolicyBought',
        timestamp: Date.now(),
        status: 'pending',
        description: `Policy purchase for ${location}`,
        amount: '0.01',
      });

      const txHash = await contractService.requestPolicy(location);
      
      // Update transaction status
      transactionService.updateTransactionStatus(
        transactionService.getTransactions()[0].id,
        'confirmed',
        txHash
      );

      setPolicyActive(true);
      alert(`✅ Policy purchased successfully!\nTx: ${txHash.slice(0, 10)}...`);
    } catch (error) {
      console.error('Failed to buy policy:', error);
      alert(`❌ Failed to buy policy: ${(error as any).message}`);
      // Log failed transaction
      transactionService.getTransactions()[0]?.id &&
        transactionService.updateTransactionStatus(
          transactionService.getTransactions()[0].id,
          'failed'
        );
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleTriggerPayout = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setPayoutLoading(true);

      // Simulate oracle weather check
      const weatherData = await oracleService.fetchWeatherData(location);
      const threshold = await contractService.getRainThreshold();

      // Check if payout should trigger
      if (weatherData.rainfall >= threshold) {
        transactionService.logTransaction({
          type: 'PayoutTriggered',
          timestamp: Date.now(),
          status: 'pending',
          description: `Payout triggered (Rainfall: ${weatherData.rainfall.toFixed(2)}mm)`,
          amount: '0.01',
        });

        const txHash = await contractService.fulfillWeather(Math.round(weatherData.rainfall));
        
        transactionService.updateTransactionStatus(
          transactionService.getTransactions()[0].id,
          'confirmed',
          txHash
        );

        alert(`✅ Payout triggered!\nRainfall: ${weatherData.rainfall.toFixed(2)}mm (Threshold: ${threshold}mm)\nTx: ${txHash.slice(0, 10)}...`);
        setPolicyActive(false);
      } else {
        alert(`❌ Payout not triggered.\nRainfall: ${weatherData.rainfall.toFixed(2)}mm\nThreshold: ${threshold}mm\nInsufficient rainfall for claim.`);
      }
    } catch (error) {
      console.error('Failed to trigger payout:', error);
      alert(`❌ Error: ${(error as any).message}`);
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleFundContract = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setPolicyLoading(true);

      transactionService.logTransaction({
        type: 'FundsDeposited',
        timestamp: Date.now(),
        status: 'pending',
        description: `Fund contract with ${fundAmount} ETH`,
        amount: fundAmount,
      });

      const txHash = await contractService.fundContract(fundAmount);

      transactionService.updateTransactionStatus(
        transactionService.getTransactions()[0].id,
        'confirmed',
        txHash
      );

      alert(`✅ Contract funded successfully with ${fundAmount} ETH!\nTx: ${txHash.slice(0, 10)}...`);
      setFundAmount('0.5');
    } catch (error) {
      console.error('Failed to fund contract:', error);
      alert(`❌ Failed to fund contract: ${(error as any).message}`);
    } finally {
      setPolicyLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Buy Policy Section */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl md:text-2xl font-bold">Purchase Policy</h2>
          </div>
          
          {/* AI Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className={`p-2 rounded-lg transition-colors ${
                useRealAI ? 'bg-purple-500 bg-opacity-20 text-purple-400' : 'bg-gray-700 text-gray-400'
              }`}
              title={useRealAI ? 'Gemini AI Active' : 'Click to enable AI'}
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key Configuration */}
        {showApiKeyInput && (
          <div className="mb-4 p-3 bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400">Gemini AI Configuration</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Enter your Gemini API key to enable real AI-powered risk assessment. 
              Get your free key at <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Google AI Studio</a>
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-dark-800 border border-purple-400 border-opacity-30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {geminiAIService.isConfigured() && (
              <p className="text-xs text-green-400 mt-2">✓ API Key configured</p>
            )}
          </div>
        )}
        
        <p className="text-gray-300 mb-4">
          Protect your crops with parametric insurance. Get instant, automated payouts when disaster strikes.
        </p>

        <div className="space-y-4 mb-6">
          {/* Location Display - entered from top card */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Farm Location</label>
            <div className="w-full bg-dark-800 border border-emerald-400 border-opacity-30 rounded-lg px-4 py-2 text-white">
              {location ? (
                <span className="flex items-center gap-2">
                  <span className="text-emerald-400">📍</span> {location}
                </span>
              ) : (
                <span className="text-gray-500">← Enter location in card above</span>
              )}
            </div>
          </div>

          {/* Weather Type Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Coverage Type</label>
            <select
              value={weatherType}
              onChange={(e) => setWeatherType(e.target.value)}
              disabled={policyActive}
              className="w-full bg-dark-800 border border-emerald-400 border-opacity-30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-400"
            >
              {WEATHER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* AI-Calculated Premium Display */}
          <div className="bg-dark-800 border border-emerald-400 border-opacity-30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="stat-label">
                  {aiAssessment ? '🤖 Gemini AI Premium' : '📊 Calculated Premium'}
                </p>
                {aiAssessment && (
                  <span className="text-xs bg-purple-500 bg-opacity-20 text-purple-400 px-2 py-0.5 rounded">
                    REAL AI
                  </span>
                )}
              </div>
              {isCalculating && <span className="text-xs text-emerald-400 animate-pulse">Analyzing...</span>}
            </div>
            
            {aiError && (
              <div className="mb-2 p-2 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded text-xs text-red-400">
                ⚠️ {aiError} - Using fallback calculation
              </div>
            )}
            
            {quote ? (
              <>
                <p className="text-2xl font-bold text-emerald-400 mt-2">
                  {aiAssessment 
                    ? `${aiAssessment.recommendedPremiumETH} ETH`
                    : `${(parseInt(quote.finalPremium) / 1e18).toFixed(4)} ETH`
                  }
                </p>
                
                {/* AI Analysis */}
                {aiAssessment && (
                  <div className="mt-3 p-2 bg-purple-500 bg-opacity-10 rounded border border-purple-500 border-opacity-20">
                    <p className="text-xs text-gray-300">{aiAssessment.weatherAnalysis}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        aiAssessment.riskLevel === 'LOW' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                        aiAssessment.riskLevel === 'MEDIUM' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                        aiAssessment.riskLevel === 'HIGH' ? 'bg-orange-500 bg-opacity-20 text-orange-400' :
                        'bg-red-500 bg-opacity-20 text-red-400'
                      }`}>
                        {aiAssessment.riskLevel} RISK
                      </span>
                      <span className="text-xs text-gray-400">Score: {aiAssessment.riskScore}/100</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Base Premium:</span>
                    <span className="text-white">{quote.basePremium} ETH</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Risk Multiplier:</span>
                    <span className="text-emerald-400 font-semibold">{quote.riskMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {aiAssessment ? 'AI Model:' : 'AI Confidence:'}
                    </span>
                    <span className="text-blue-400">
                      {aiAssessment ? aiAssessment.aiModel : `${quote.confidence.toFixed(0)}%`}
                    </span>
                  </div>
                </div>
                
                {/* Risk Factors */}
                {quote.riskFactors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Risk Factors:</p>
                    <div className="flex flex-wrap gap-1">
                      {quote.riskFactors.map((factor, idx) => (
                        <span key={idx} className="text-xs bg-yellow-500 bg-opacity-20 text-yellow-400 px-2 py-1 rounded">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-500 mt-2">— ETH</p>
                <p className="text-xs text-gray-400 mt-2">Enter location above to calculate premium</p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Coverage Period</span>
              <span className="text-white font-semibold">12 Months</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Max Payout</span>
              <span className="text-white font-semibold">
                {quote ? `${(parseInt(quote.finalPremium) / 1e18 * 2).toFixed(4)} ETH` : '— ETH'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className={`font-semibold ${policyActive ? 'text-green-400' : 'text-orange-400'}`}>
                {policyActive ? '✓ Active' : '○ Inactive'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleBuyPolicy}
          disabled={policyLoading || !isConnected || policyActive || !quote}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {policyLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Processing...
            </span>
          ) : policyActive ? (
            '✓ Policy Active'
          ) : !quote ? (
            '📍 Enter Location First'
          ) : (
            `🛡️ Purchase Policy (${(parseInt(quote.finalPremium) / 1e18).toFixed(4)} ETH)`
          )}
        </button>
      </div>

      {/* Claim & Payout Section */}
      <div className="glass-card">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl md:text-2xl font-bold">Weather & Payout</h2>
        </div>

        <p className="text-gray-300 mb-4">
          Monitor weather conditions and trigger payouts when rainfall exceeds the threshold.
        </p>

        <div className="bg-dark-800 border border-blue-500 border-opacity-30 rounded-lg p-4 mb-6">
          <p className="stat-label">Weather Status</p>
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${policyActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`}></div>
              <p className="text-lg font-semibold text-white">{policyActive ? 'Monitoring' : 'No Active Policy'}</p>
            </div>
            <p className="text-xs text-gray-400">Rain Threshold: 50mm</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Policy Status</span>
            <span className={`font-semibold ${policyActive ? 'text-green-400' : 'text-gray-400'}`}>
              {policyActive ? '✓ Active' : '○ Inactive'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Eligible for Payout</span>
            <span className={`font-semibold ${policyActive ? 'text-yellow-400' : 'text-gray-400'}`}>
              {policyActive ? 'Pending Weather' : 'No'}
            </span>
          </div>
        </div>

        <button
          onClick={handleTriggerPayout}
          disabled={payoutLoading || !isConnected || !policyActive}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {payoutLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Processing...
            </span>
          ) : !policyActive ? (
            '○ No Active Policy'
          ) : (
            '⛈️ Check & Trigger Payout'
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Payouts trigger automatically when rainfall ≥ 50mm
        </p>
      </div>

      {/* Fund Pool Section */}
      <div className="glass-card">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl md:text-2xl font-bold">Fund Pool</h2>
        </div>

        <p className="text-gray-300 mb-4">
          Contribute ETH to the insurance pool to earn returns from premiums and support payouts.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Amount (ETH)</label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full bg-dark-800 border border-yellow-400 border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="0.5"
            />
          </div>

          <div className="bg-dark-800 border border-yellow-400 border-opacity-30 rounded-lg p-4">
            <p className="stat-label">Estimated Return</p>
            <p className="text-2xl font-bold text-yellow-400 mt-2">
              {(parseFloat(fundAmount) * 0.15).toFixed(4)} ETH
            </p>
            <p className="text-xs text-gray-400 mt-2">15% annual return (estimated)</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Pool Size</span>
              <span className="text-white font-semibold">Variable</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Lock Period</span>
              <span className="text-white font-semibold">None</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleFundContract}
          disabled={policyLoading || !isConnected || parseFloat(fundAmount) <= 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {policyLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Processing...
            </span>
          ) : (
            '💰 Fund Pool'
          )}
        </button>
      </div>

      {/* Claimed & Pending Policies Section */}
      <div className="glass-card">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl md:text-2xl font-bold">Claims Status</h2>
        </div>

        {!isConnected ? (
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <p className="text-gray-400">Connect your wallet to view claims</p>
          </div>
        ) : (
          <>
            <p className="text-gray-300 mb-4">
              Track your claimed policies and pending payouts.
            </p>

            {/* Claimed Policies */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Claimed Policies
              </h3>
              
              {claimedPolicies.length > 0 ? (
                <div className="space-y-2">
                  {claimedPolicies.map((policy) => (
                    <div key={policy.id} className="bg-dark-800 border border-emerald-400 border-opacity-30 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{policy.name}</p>
                          <p className="text-xs text-gray-400 mt-1">Claimed on {policy.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-400">{policy.amount}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-emerald-500 bg-opacity-20 text-emerald-300 text-xs font-semibold rounded">
                            ✓ Claimed
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-dark-800 border border-emerald-400 border-opacity-20 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">No claimed policies yet</p>
                </div>
              )}
            </div>

            {/* About to be Claimed / Pending Claims */}
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Claims
              </h3>
              
              {pendingClaims.length > 0 ? (
                <div className="space-y-2">
                  {pendingClaims.map((claim) => (
                    <div key={claim.id} className="bg-dark-800 border border-yellow-400 border-opacity-30 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{claim.name}</p>
                          <p className="text-xs text-gray-400 mt-1">Triggered on {claim.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-yellow-400">{claim.amount}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-300 text-xs font-semibold rounded">
                            ⏳ Pending
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-dark-800 border border-yellow-400 border-opacity-20 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm">No pending claims</p>
                </div>
              )}
            </div>

            <div className="mt-6 p-3 bg-blue-500 bg-opacity-10 border border-blue-400 border-opacity-20 rounded-lg">
              <p className="text-xs text-blue-300 text-center">
                💡 Automatic payouts are processed when weather conditions trigger claim thresholds.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
