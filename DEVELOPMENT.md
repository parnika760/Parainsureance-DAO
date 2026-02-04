# ParaShield - Developer Documentation

## Overview

ParaShield is a decentralized parametric insurance platform that uses smart contracts and Chainlink oracles to provide automated crop insurance for farmers. This documentation covers the architecture, components, and how to work with the system.

## Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────┐
│   React Frontend (This Project)     │
│   - Dashboard, Components, Pages    │
└────────────┬────────────────────────┘
             │
┌────────────▼──────────────────────────┐
│   Service Layer                       │
│   - Contract Service                  │
│   - Oracle Service                    │
│   - Transaction Service               │
└────────────┬──────────────────────────┘
             │
┌────────────▼──────────────────────────┐
│   Blockchain (Sepolia Testnet)       │
│   - Insurance Contract                │
│   - Chainlink Oracles                 │
│   - MetaMask Wallet                   │
└───────────────────────────────────────┘
```

## Core Services

### 1. Contract Service (`contractService.ts`)

Handles all smart contract interactions.

**Key Methods:**

```typescript
// Get ETH/USD price from Chainlink
getETHPrice(): Promise<{price: number, decimals: number}>

// Request a new insurance policy
requestPolicy(location: string): Promise<string>

// Get current policy status
getPolicyStatus(): Promise<PolicyData>

// Get contract balance
getContractBalance(): Promise<string>

// Fund the contract
fundContract(amount: string): Promise<string>

// Fulfill weather data (trigger payout)
fulfillWeather(rainfall: number): Promise<string>

// Get rain threshold
getRainThreshold(): Promise<number>
```

### 2. Oracle Service (`oracleService.ts`)

Manages weather data and oracle-related operations.

**Key Methods:**

```typescript
// Fetch weather data for a location
fetchWeatherData(location: string): Promise<WeatherData>

// Store weather history
storeWeatherData(location: string, data: WeatherData): void

// Get weather history
getWeatherHistory(location: string): WeatherData[]

// Check if payout should trigger
shouldTriggerPayout(rainfall: number, threshold: number): boolean
```

### 3. Transaction Service (`transactionService.ts`)

Tracks all blockchain transactions and user interactions.

**Key Methods:**

```typescript
// Log a transaction
logTransaction(log: Omit<TransactionLog, 'id'>): TransactionLog

// Get all transactions
getTransactions(): TransactionLog[]

// Get transactions by type
getTransactionsByType(type: string): TransactionLog[]

// Update transaction status
updateTransactionStatus(id: string, status: string, txHash?: string)

// Get statistics
getStatistics(): {total, confirmed, pending, failed, totalAmount}
```

## Smart Contract Integration

### Contract Address
- **Network**: Sepolia Testnet
- **Address**: `0xE529a659d1de4025A4044E6472C26B6224dADCb4`

### Contract Functions

#### requestPolicy(string location)
```solidity
// User purchases insurance policy for a specific farm location
// Requires: 0.01 ETH
// Emits: PolicyRequested event
```

#### fulfillWeather(uint256 rainfall)
```solidity
// Oracle fulfills weather data
// Triggers automatic payout if rainfall >= threshold
// Emits: WeatherReceived, PayoutTriggered events
```

### Key Parameters
- **Premium**: 0.01 ETH
- **Payout**: 0.01 ETH
- **Rain Threshold**: 50mm

## Data Flow

### Policy Purchase Flow

```
User → Connect Wallet → Select Location → Approve TX → 
Smart Contract → Emit PolicyRequested → Transaction Logged
```

### Payout Trigger Flow

```
Oracle Fetches Weather → Calls fulfillWeather() → 
Smart Contract Checks Rainfall → If >= 50mm → Transfer Payout → 
Emit PayoutTriggered → Transaction Logged
```

## Web3 Context

The `Web3Context` manages global blockchain state:

```typescript
interface Web3ContextType {
  account: string | null;           // Connected wallet address
  isConnecting: boolean;             // Connection loading state
  isConnected: boolean;              // Connection status
  provider: ethers.Provider | null;  // Blockchain provider
  signer: ethers.Signer | null;      // User's signer
  chainId: number | null;            // Current chain ID
  balance: string | null;            // Wallet balance in ETH
  ethPrice: number | null;           // Current ETH/USD price
  connectWallet: () => Promise<void>; // Connect function
  disconnectWallet: () => void;      // Disconnect function
}
```

## Component Architecture

### Header Component
- Wallet connection button
- Navigation links
- Displays connected account

### StatsOverview Component
- Real-time ETH/USD price (Chainlink)
- Current policy status
- Pool liquidity

### ActionCenter Component
- **Buy Policy Section**: Purchase insurance for farm location
- **Weather & Payout Section**: Check weather and trigger payouts
- **Fund Pool Section**: Contribute ETH to earn returns

### TransactionHistory Component
- Lists all transactions with status
- Links to Etherscan
- Statistics dashboard

## Error Handling

Custom error types for different scenarios:

```typescript
// Base error type
InsuranceError: {code, message, details}

// Specific error types
ContractError: Contract-related failures
WalletError: Wallet connection issues
ValidationError: Input validation failures
```

## Type System

### Core Types

```typescript
// Policy data
interface PolicyData {
  farmer: string;
  policyActive: boolean;
  policyPaid: boolean;
  farmLocation: string;
  lastReportedRainfall: number;
  premiumAmount: string;
  payoutAmount: string;
}

// Weather data
interface WeatherData {
  location: string;
  rainfall: number;
  timestamp: number;
  humidity?: number;
  temperature?: number;
}

// Transaction log
interface TransactionLog {
  id: string;
  type: 'PolicyBought' | 'PayoutTriggered' | 'WeatherReported' | 'FundsDeposited';
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  amount?: string;
  txHash?: string;
  description: string;
}
```

## Configuration

Edit `config/constants.ts` for:

- Contract addresses
- Network configuration
- Gas limits
- UI refresh intervals
- Feature flags

## Environment Setup

1. **MetaMask**: Install MetaMask browser extension
2. **Sepolia Testnet**: Switch to Sepolia in MetaMask
3. **Test ETH**: Get from [Sepolia Faucet](https://sepoliafaucet.com/)

## Development Workflow

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Connect Wallet
- Click "Connect Wallet"
- Approve connection in MetaMask
- Ensure you're on Sepolia network

### 3. Test Features
- Check ETH price updates
- Purchase a policy
- Trigger weather check
- Fund the pool
- View transaction history

### 4. Monitor Transactions
- Check transaction status in UI
- Verify on Etherscan via links
- Review transaction history

## Security Considerations

1. **Never expose private keys** in frontend code
2. **Validate all inputs** before sending to contract
3. **Use ethers.js** for secure wallet interaction
4. **Check network ID** before sending transactions
5. **Implement rate limiting** for API calls
6. **Sanitize user inputs** to prevent XSS

## Performance Optimization

- **Lazy loading** of components with React.lazy()
- **Memoization** with React.memo() for expensive renders
- **Debounced** wallet/contract state updates
- **Caching** of transaction history in localStorage
- **Gas optimization** with reasonable limits

## Future Improvements

1. **Multi-chain Support**: Add Mainnet, Polygon, Arbitrum
2. **Advanced Analytics**: Dashboard with charts and statistics
3. **Real Weather APIs**: Integrate with OpenWeatherMap API
4. **Chainlink Functions**: Automated oracle updates
5. **Governance**: DAO voting on policy parameters
6. **Mobile App**: React Native version
7. **Subgraph Indexing**: The Graph for faster queries
8. **Advanced UI**: D3.js visualizations

## Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## Deployment

### Production Build
```bash
npm run build
```

### Deployment Platforms
- Vercel (recommended)
- Netlify
- IPFS (decentralized)
- GitHub Pages

### Pre-deployment Checklist
- [ ] Update contract addresses for mainnet
- [ ] Disable debug mode
- [ ] Update API endpoints
- [ ] Test all features
- [ ] Review security
- [ ] Optimize bundle size

## Support & Resources

- **Solidity Docs**: https://docs.soliditylang.org/
- **Ethers.js Docs**: https://docs.ethers.org/
- **React Docs**: https://react.dev/
- **Chainlink Docs**: https://docs.chain.link/
- **Tailwind CSS**: https://tailwindcss.com/

## License

MIT License - see LICENSE file

## Contributors

- Development Team
- Smart Contract Auditors
- Community Contributors

## Contact

For support or questions, please open an issue in the repository.
