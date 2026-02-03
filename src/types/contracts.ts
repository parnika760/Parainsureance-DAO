// Contract types and interfaces
export interface PolicyData {
  farmer: string;
  policyActive: boolean;
  policyPaid: boolean;
  farmLocation: string;
  lastReportedRainfall: number;
  premiumAmount: string;
  payoutAmount: string;
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
  type: 'PolicyBought' | 'PayoutTriggered' | 'WeatherReported' | 'FundsDeposited';
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  amount?: string;
  txHash?: string;
  description: string;
}
