import { Clock, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import { TransactionLog } from '../types/contracts';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-500 bg-opacity-20 text-emerald-400';
    case 'pending':
      return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
    case 'failed':
      return 'bg-red-500 bg-opacity-20 text-red-400';
    default:
      return 'bg-gray-500 bg-opacity-20 text-gray-400';
  }
};

const getTypeLabel = (type: TransactionLog['type']) => {
  switch (type) {
    case 'PolicyBought':
      return '🛡️ Policy Purchase';
    case 'PayoutTriggered':
      return '💰 Payout Issued';
    case 'WeatherReported':
      return '⛈️ Weather Data';
    case 'FundsDeposited':
      return '💎 Pool Funding';
    default:
      return type;
  }
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [stats, setStats] = useState(transactionService.getStatistics());

  useEffect(() => {
    const refreshTransactions = () => {
      setTransactions(transactionService.getTransactions());
      setStats(transactionService.getStatistics());
    };

    refreshTransactions();
    // Poll for updates every 5 seconds
    const interval = setInterval(refreshTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  const getExplorerUrl = (txHash?: string) => {
    if (!txHash) return null;
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl md:text-2xl font-bold">Transaction History</h2>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-emerald-400 font-bold">{stats.confirmed}</p>
            <p className="text-gray-400 text-xs">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-400 font-bold">{stats.pending}</p>
            <p className="text-gray-400 text-xs">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-red-400 font-bold">{stats.failed}</p>
            <p className="text-gray-400 text-xs">Failed</p>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-gray-500 text-5xl mb-4">📤</div>
          <p className="text-gray-400 text-lg">No transactions yet</p>
          <p className="text-gray-500 text-sm mt-2">Your contract interactions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="glass-card-sm flex items-center justify-between hover:bg-opacity-50 transition"
            >
              <div className="flex-1">
                <p className="font-semibold text-white">{getTypeLabel(tx.type)}</p>
                <p className="text-sm text-gray-400 mt-1">{tx.description}</p>
                <p className="text-xs text-gray-500 mt-2">{formatDate(tx.timestamp)}</p>
              </div>

              <div className="flex items-center gap-4">
                {tx.amount && (
                  <p className="font-bold text-emerald-400 text-sm">{tx.amount} ETH</p>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tx.status)}`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
                {tx.txHash && (
                  <a
                    href={getExplorerUrl(tx.txHash) || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition"
                    title="View on Etherscan"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
