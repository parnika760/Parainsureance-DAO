import { MapPin, TrendingUp, Activity } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { contractService } from '../services/contractService';
import { aiPremiumService, PremiumCalculationResult } from '../services/aiPremiumService';

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

// Location context for sharing between components
export const LocationContext = {
  location: '',
  quote: null as PremiumCalculationResult | null,
  listeners: [] as ((location: string, quote: PremiumCalculationResult | null) => void)[],
  
  setLocation(location: string, quote: PremiumCalculationResult | null) {
    this.location = location;
    this.quote = quote;
    this.listeners.forEach(fn => fn(location, quote));
  },
  
  subscribe(fn: (location: string, quote: PremiumCalculationResult | null) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }
};

export const StatsOverview = () => {
  const { isConnected } = useWeb3();
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [policyStatus, setPolicyStatus] = useState<string>('Inactive');
  const [loading, setLoading] = useState(false);
  
  // Location input state
  const [location, setLocation] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [quote, setQuote] = useState<PremiumCalculationResult | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const availableLocations = aiPremiumService.getAvailableLocations();
  
  // Filter locations based on input
  const filteredLocations = location.length >= 1
    ? availableLocations.filter(loc => 
        loc.toLowerCase().includes(location.toLowerCase())
      ).slice(0, 15) // Limit to 15 suggestions
    : [];

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

  // Calculate premium when location changes
  const handleLocationChange = useCallback((newLocation: string) => {
    setLocation(newLocation);
    
    if (newLocation.trim().length >= 3) {
      setIsCalculating(true);
      
      // Debounce the calculation
      const timeout = setTimeout(() => {
        try {
          const result = aiPremiumService.calculatePremium({
            location: newLocation,
            weatherType: 'Drought', // Default, can be changed in ActionCenter
            baselineAmount: '0.01',
          });
          setQuote(result);
          // Share with ActionCenter
          LocationContext.setLocation(newLocation, result);
        } catch (error) {
          console.error('Error calculating premium:', error);
          setQuote(null);
        } finally {
          setIsCalculating(false);
        }
      }, 300);
      
      return () => clearTimeout(timeout);
    } else {
      setQuote(null);
      LocationContext.setLocation('', null);
    }
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Location Input Card - Replaces ETH Price */}
      <div className="glass-card">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="stat-label">Farm Location</p>
          </div>
          <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-lg">
            <MapPin className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={location}
            onChange={(e) => {
              handleLocationChange(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search: Punjab, Rajasthan, Mumbai..."
            className="w-full bg-dark-800 border border-emerald-400 border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 text-sm"
          />
          
          {/* Custom Dropdown */}
          {showSuggestions && filteredLocations.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-dark-800 border border-emerald-400 border-opacity-30 rounded-lg max-h-48 overflow-y-auto shadow-xl">
              {filteredLocations.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    handleLocationChange(loc);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-emerald-500 hover:bg-opacity-20 hover:text-emerald-400 transition-colors"
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {isCalculating ? (
          <p className="text-xs text-gray-400 mt-2">🔄 Calculating risk...</p>
        ) : quote ? (
          <div className="mt-2">
            <p className="text-xs text-emerald-400">
              ✓ Risk Multiplier: <span className="font-bold">{quote.riskMultiplier}x</span>
            </p>
            <p className="text-xs text-gray-400">AI Confidence: {quote.confidence.toFixed(0)}%</p>
          </div>
        ) : location.length > 0 && location.length < 3 ? (
          <p className="text-xs text-gray-400 mt-2">Type at least 3 characters...</p>
        ) : (
          <p className="text-xs text-gray-400 mt-2">🇮🇳 All Indian states, cities & regions</p>
        )}
      </div>

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
