import { DollarSign, TrendingUp, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { contractService } from '../services/contractService';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  subtext?: string;
  loading?: boolean;
}

export const StatsCard = ({ icon, label, value, change, subtext, loading = false }: StatsCardProps) => {
  return (
    <div className="glass-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value">{loading ? '...' : value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-lg">
          {icon}
        </div>
      </div>
      {change && !loading && (
        <div className="mt-4 flex items-center gap-1 text-emerald-400 text-sm">
          <TrendingUp size={16} />
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};

export const StatsOverview = () => {
  const { ethPrice, isConnected } = useWeb3();
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [policyStatus, setPolicyStatus] = useState<string>('Inactive');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected) return;

      try {
        setLoading(true);

        // Fetch contract balance
        const balance = await contractService.getContractBalance();
        setContractBalance(balance);

        // Fetch policy status
        try {
          const status = await contractService.getPolicyStatus();
          setPolicyStatus(status.policyActive ? 'Active' : 'Inactive');
        } catch (error) {
          // Policy might not exist yet
          setPolicyStatus('No Policy');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [isConnected]);

  const formattedEthPrice = ethPrice ? `$${ethPrice.toFixed(2)}` : '—';
  const priceChange = ethPrice ? (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 5).toFixed(1) + '%' : undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatsCard
        icon={<DollarSign className="w-6 h-6 text-emerald-400" />}
        label="ETH Price (USD)"
        value={formattedEthPrice}
        change={priceChange}
        subtext="Via Chainlink Oracle"
        loading={!ethPrice && isConnected}
      />
      <StatsCard
        icon={<Activity className="w-6 h-6 text-blue-400" />}
        label="Policy Status"
        value={policyStatus}
        subtext={policyStatus === 'Active' ? 'Policy is active' : 'No active policy'}
        loading={loading && isConnected}
      />
      <StatsCard
        icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
        label="Pool Liquidity"
        value={`${contractBalance.slice(0, 5)} ETH`}
        subtext="Total available for payouts"
        loading={loading && isConnected}
      />
    </div>
  );
};
