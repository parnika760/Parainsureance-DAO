/**
 * Application Configuration
 * Smart contract addresses, networks, and constants
 */

// Smart Contract Configuration
export const CONTRACT_CONFIG = {
  // Sepolia Testnet
  INSURANCE_CONTRACT: '0x5Cea979df129614c09C6E7AA45b568B37b740726',
  CHAINLINK_ETH_USD_FEED: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
  ORACLE_ADDRESS: '0x0000000000000000000000000000000000000000', // Set to your oracle address

  // Contract Parameters
  PREMIUM: '0.01', // ETH
  PAYOUT_AMOUNT: '0.01', // ETH
  RAIN_THRESHOLD: 50, // mm

  // Network Configuration
  CHAIN_ID: 11155111, // Sepolia
  CHAIN_NAME: 'Sepolia',
  RPC_URL: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
};

// UI Configuration
export const UI_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  TRANSACTION_TIMEOUT: 120000, // 2 minutes
  MAX_HISTORY_SIZE: 50,
};

// Feature Flags
export const FEATURES = {
  ENABLE_WEATHER_API: true,
  ENABLE_ORACLE_UPDATES: true,
  ENABLE_ANALYTICS: true,
  DEBUG_MODE: false,
};

// Gas Configuration
export const GAS_CONFIG = {
  REQUEST_POLICY: 500000,
  FULFILL_WEATHER: 500000,
  FUND_CONTRACT: 300000,
  DEFAULT_GAS_PRICE_MULTIPLIER: 1.2,
};

// Chainlink Functions Configuration (for production)
export const CHAINLINK_FUNCTIONS = {
  ROUTER_ADDRESS: '0x0000000000000000000000000000000000000000',
  DON_ID: 'fun-sepolia-1',
  SUBSCRIPTION_ID: 0,
};

// Weather API Configuration (mock for now)
export const WEATHER_API = {
  ENDPOINT: 'https://api.openweathermap.org/data/2.5/weather',
  TIMEOUT: 10000,
  USE_MOCK: true, // Set to false when using real API
};
