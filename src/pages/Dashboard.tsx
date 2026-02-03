import { Header } from '../components/Header';
import { StatsOverview } from '../components/StatsOverview';
import { ActionCenter } from '../components/ActionCenter';
import { TransactionHistory } from '../components/TransactionHistory';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Page Title */}
        <div className="mb-12">
          <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-2">
            ● Sepolia Testnet
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Parametric Insurance
            <span className="block text-emerald-400">for Modern Farmers</span>
          </h1>
          <p className="text-gray-300 max-w-2xl text-lg">
            Decentralized, transparent, and automated crop insurance powered by smart contracts and Chainlink oracles.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Action Center */}
        <ActionCenter />

        {/* Transaction History */}
        <TransactionHistory />
      </main>
    </div>
  );
};
