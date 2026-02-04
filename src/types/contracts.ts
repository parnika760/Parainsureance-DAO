// Contract types and interfaces
export interface PolicyData {
  farmer: string;
  policyActive: boolean;
  policyPaid: boolean;
  farmLocation: string;
  lastReportedRainfall: number;
  premiumAmount: string;
  payoutAmount: string;
  location?: string;
  weatherType?: string;
  purchaseTime?: number;
  claimTime?: number;
}

export interface WeatherData {
  location: string;
  rainfall: number;
  timestamp: number;
  humidity?: number;
  temperature?: number;
}

export interface OracleResponse {
  rainfall: number;
  location: string;
  timestamp: number;
  confirmed: boolean;
}

export interface ContractConfig {
  contractAddress: string;
  oracleAddress?: string;
  chainId: number;
  rpcUrl: string;
}

export interface TransactionLog {
  id: string;
  type: 'PolicyBought' | 'PayoutTriggered' | 'WeatherReported' | 'FundsDeposited' | 'LocationVerified';
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  amount?: string;
  txHash?: string;
  description: string;
  location?: string;
}

// Insurance-specific types
export interface InsurancePolicy {
  farmer: string;
  location: string;
  weatherType: 'ExcessiveRainfall' | 'HeatWave' | 'Hailstorm' | 'Drought' | 'Frost' | 'MultiHazard';
  premiumPaid: string;
  payoutAmount: string;
  active: boolean;
  paid: boolean;
  purchaseTime: number;
  claimTime: number;
}

export interface PremiumQuote {
  location: string;
  weatherType: string;
  basePremium: string;
  riskMultiplier: number;
  finalPremium: string;
  riskFactors: string[];
  confidence: number;
}

export interface ClaimRequest {
  farmer: string;
  location: string;
  weatherType: string;
  timestamp: number;
  weatherData: {
    rainfall?: number;
    temperature?: number;
    windSpeed?: number;
    frostDetected?: boolean;
  };
}
