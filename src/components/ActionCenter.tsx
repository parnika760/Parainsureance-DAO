import { ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { contractService } from '../services/contractService';
import { oracleService } from '../services/oracleService';
import { transactionService } from '../services/transactionService';

export const ActionCenter = () => {
  const { isConnected } = useWeb3();
  const [policyLoading, setPolicyLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [location, setLocation] = useState('Sepolia Farm');
  const [policyActive, setPolicyActive] = useState(false);
  const [fundAmount, setFundAmount] = useState('0.5');

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
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl md:text-2xl font-bold">Purchase Policy</h2>
        </div>
        
        <p className="text-gray-300 mb-4">
          Protect your crops with parametric insurance. Get instant, automated payouts when disaster strikes.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">Farm Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={policyActive}
              className="w-full bg-dark-800 border border-emerald-400 border-opacity-30 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
              placeholder="e.g., Sepolia Farm"
            />
          </div>

          <div className="bg-dark-800 border border-emerald-400 border-opacity-30 rounded-lg p-4">
            <p className="stat-label">Premium Cost</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">0.01 ETH</p>
            <p className="text-xs text-gray-400 mt-2">One-time premium for annual coverage</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Coverage Period</span>
              <span className="text-white font-semibold">12 Months</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Max Payout</span>
              <span className="text-white font-semibold">0.01 ETH</span>
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
          disabled={policyLoading || !isConnected || policyActive}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {policyLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Processing...
            </span>
          ) : policyActive ? (
            '✓ Policy Active'
          ) : (
            '🛡️ Purchase Policy'
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
    </div>
  );
};
