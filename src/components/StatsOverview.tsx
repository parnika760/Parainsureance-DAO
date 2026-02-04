import { MapPin, TrendingUp, Activity, ChevronDown } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWeb3 } from '../context/Web3Context';
import { contractService } from '../services/contractService';
import { aiPremiumService, PremiumCalculationResult } from '../services/aiPremiumService';

// All Indian Cities organized by category
const INDIAN_CITIES = {
  'States': [
    'Punjab', 'Haryana', 'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh',
    'Jammu & Kashmir', 'Ladakh', 'Delhi', 'Rajasthan', 'Gujarat', 'Maharashtra',
    'Goa', 'West Bengal', 'Bihar', 'Jharkhand', 'Odisha', 'Andhra Pradesh',
    'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Madhya Pradesh',
    'Chhattisgarh', 'Assam', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland',
    'Manipur', 'Mizoram', 'Tripura', 'Sikkim'
  ],
  'Tier 1 Cities': [
    'Mumbai, Maharashtra', 'Delhi', 'Bengaluru, Karnataka', 'Hyderabad, Telangana',
    'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Ahmedabad, Gujarat', 'Pune, Maharashtra'
  ],
  'Tier 2 Cities': [
    'Jaipur, Rajasthan', 'Lucknow, UP', 'Kanpur, UP', 'Nagpur, Maharashtra',
    'Indore, MP', 'Bhopal, MP', 'Patna, Bihar', 'Vadodara, Gujarat',
    'Surat, Gujarat', 'Ludhiana, Punjab', 'Agra, UP', 'Nashik, Maharashtra',
    'Varanasi, UP', 'Meerut, UP', 'Rajkot, Gujarat', 'Visakhapatnam, AP',
    'Coimbatore, Tamil Nadu', 'Madurai, Tamil Nadu', 'Kochi, Kerala',
    'Thiruvananthapuram, Kerala', 'Guwahati, Assam', 'Chandigarh',
    'Mysuru, Karnataka', 'Vijayawada, AP', 'Jodhpur, Rajasthan'
  ],
  'Tier 3 Cities': [
    'Amritsar, Punjab', 'Jalandhar, Punjab', 'Patiala, Punjab', 'Bathinda, Punjab',
    'Gurugram, Haryana', 'Faridabad, Haryana', 'Hisar, Haryana', 'Karnal, Haryana',
    'Prayagraj, UP', 'Gorakhpur, UP', 'Udaipur, Rajasthan', 'Kota, Rajasthan',
    'Bikaner, Rajasthan', 'Jaisalmer, Rajasthan', 'Aurangabad, Maharashtra',
    'Solapur, Maharashtra', 'Kolhapur, Maharashtra', 'Bhavnagar, Gujarat',
    'Kutch, Gujarat', 'Jabalpur, MP', 'Gwalior, MP', 'Gaya, Bihar',
    'Muzaffarpur, Bihar', 'Siliguri, West Bengal', 'Durgapur, West Bengal',
    'Hubli, Karnataka', 'Shillong, Meghalaya', 'Imphal, Manipur',
    'Agartala, Tripura', 'Gangtok, Sikkim'
  ],
  'Agricultural Regions': [
    'Vidarbha, Maharashtra', 'Marathwada, Maharashtra', 'Bundelkhand, UP/MP',
    'Malwa, MP', 'Doab Region, UP', 'Terai Region', 'Konkan, Maharashtra',
    'Cauvery Delta, TN', 'Sundarbans, WB'
  ]
};

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update dropdown position when it opens
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, [showDropdown]);
  // Get all cities flattened for search
  const allCities = Object.values(INDIAN_CITIES).flat();
  
  // Filter cities based on search
  const filteredCities = searchTerm.length >= 1
    ? allCities.filter(city => 
        city.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
        
        <div>
          {/* Selected Location Display / Dropdown Trigger */}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full bg-dark-800 border border-emerald-400 border-opacity-30 rounded-lg px-3 py-2 text-left text-sm flex items-center justify-between focus:outline-none focus:border-emerald-400"
          >
            <span className={location ? 'text-white' : 'text-gray-500'}>
              {location || 'Select your city...'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown Menu - Rendered as Portal */}
          {showDropdown && createPortal(
            <>
              {/* Invisible backdrop */}
              <div 
                className="fixed inset-0"
                style={{ zIndex: 99998 }}
                onClick={() => setShowDropdown(false)}
              />
              <div 
                className="fixed bg-dark-800 border border-emerald-400 border-opacity-50 rounded-lg shadow-2xl"
                style={{ 
                  zIndex: 99999, 
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  maxHeight: '280px'
                }}
              >
                {/* Search Input */}
                <div className="p-2 border-b border-gray-700 bg-dark-800 rounded-t-lg">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search cities..."
                    className="w-full bg-dark-900 border border-gray-600 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400"
                    autoFocus
                  />
                </div>
                
                <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  {searchTerm.length >= 1 ? (
                    // Show search results
                    filteredCities.length > 0 ? (
                      filteredCities.slice(0, 20).map((city, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            handleLocationChange(city);
                            setShowDropdown(false);
                          setSearchTerm('');
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-emerald-500 hover:bg-opacity-20 hover:text-emerald-400 transition-colors"
                      >
                        {city}
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-500">No cities found</p>
                  )
                ) : (
                  // Show categorized list
                  Object.entries(INDIAN_CITIES).map(([category, cities]) => (
                    <div key={category}>
                      <div className="px-3 py-2 bg-dark-900 text-xs font-semibold text-emerald-400 sticky top-0">
                        {category} ({cities.length})
                      </div>
                      {cities.map((city, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            handleLocationChange(city);
                            setShowDropdown(false);
                            setSearchTerm('');
                          }}
                          className="w-full text-left px-4 py-1.5 text-sm text-gray-300 hover:bg-emerald-500 hover:bg-opacity-20 hover:text-emerald-400 transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
            </>,
            document.body
          )}
        </div>
        
        {isCalculating ? (
          <p className="text-xs text-gray-400 mt-2">Calculating risk...</p>
        ) : quote ? (
          <div className="mt-2">
            <p className="text-xs text-emerald-400">
              ✓ Risk Multiplier: <span className="font-bold">{quote.riskMultiplier.toFixed(2)}x</span>
            </p>
            <p className="text-xs text-gray-400">AI Confidence: {quote.confidence.toFixed(0)}%</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2">All Indian states, cities & regions</p>
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
  );};