# Smart Contract API Reference

## Insurance Contract

**Network**: Sepolia Testnet  
**Address**: `0x5Cea979df129614c09C6E7AA45b568B37b740726`  
**Standard**: ERC-20 Compatible with custom functions

### State Variables

#### Constants

```solidity
uint256 PREMIUM = 0.01 ether;
uint256 PAYOUT_AMOUNT = 0.01 ether;
uint256 RAIN_THRESHOLD = 50; // mm
```

#### Mutable State

```solidity
address farmer;              // Current policyholder
bool policyActive;          // Policy status
bool policyPaid;            // Payout claim status
string farmLocation;        // Farm location identifier
uint256 lastReportedRainfall; // Latest rainfall reading
address oracle;             // Oracle address for updates
```

### Functions

#### requestPolicy

Purchase an insurance policy for a farm location.

```solidity
function requestPolicy(string calldata location) external payable
```

**Parameters:**
- `location` (string): Farm location identifier

**Requirements:**
- `msg.value == PREMIUM` (0.01 ETH)
- `!policyActive` (No existing active policy)

**Emits:**
- `PolicyRequested(farmer, location)`
- `WeatherRequested(location)`

**Returns:** None

**Example (TypeScript):**
```typescript
await contractService.requestPolicy("My Farm");
```

#### fulfillWeather

Submit weather data and trigger automatic payout if conditions met.

```solidity
function fulfillWeather(uint256 rainfall) external onlyOracle
```

**Parameters:**
- `rainfall` (uint256): Rainfall in millimeters

**Requirements:**
- `policyActive` (Policy must be active)
- `!policyPaid` (Payout not yet issued)
- Caller must be oracle address
- Contract must have sufficient balance for payout

**Logic:**
- If `rainfall >= RAIN_THRESHOLD`:
  - Payout triggered
  - Funds transferred to farmer
  - Policy marked as paid
  - Emits `PayoutTriggered`

**Emits:**
- `WeatherReceived(rainfall)`
- `PayoutTriggered(farmer, PAYOUT_AMOUNT)` [conditional]

**Example (TypeScript):**
```typescript
await contractService.fulfillWeather(75); // 75mm rainfall
```

#### getContractBalance

Get the current balance of the insurance pool.

```solidity
function getContractBalance() external view returns (uint256)
```

**Returns:** Balance in wei

**Example (TypeScript):**
```typescript
const balance = await contractService.getContractBalance();
// Returns: "0.5" (0.5 ETH)
```

#### getRainThreshold

Get the rainfall threshold for automatic payout.

```solidity
function getRainThreshold() external view returns (uint256)
```

**Returns:** Threshold in millimeters (50)

**Example (TypeScript):**
```typescript
const threshold = await contractService.getRainThreshold();
// Returns: 50
```

### Events

#### PolicyRequested

Emitted when a new policy is purchased.

```solidity
event PolicyRequested(address indexed farmer, string location)
```

**Parameters:**
- `farmer`: Policyholder address
- `location`: Farm location

#### WeatherRequested

Emitted when weather data is needed.

```solidity
event WeatherRequested(string location)
```

**Parameters:**
- `location`: Location for which weather is needed

#### WeatherReceived

Emitted when weather data is received from oracle.

```solidity
event WeatherReceived(uint256 rainfall)
```

**Parameters:**
- `rainfall`: Rainfall amount in millimeters

#### PayoutTriggered

Emitted when payout is issued to farmer.

```solidity
event PayoutTriggered(address indexed farmer, uint256 amount)
```

**Parameters:**
- `farmer`: Recipient address
- `amount`: Payout amount in wei

## Chainlink Price Feed

**Address**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`  
**Pair**: ETH / USD  
**Network**: Sepolia Testnet

### Interface: AggregatorV3Interface

#### latestRoundData

Get the latest ETH/USD price data.

```solidity
function latestRoundData() external view returns (
    uint80 roundId,
    int256 answer,
    uint256 startedAt,
    uint256 updatedAt,
    uint80 answeredInRound
)
```

**Returns:**
- `roundId`: Unique round identifier
- `answer`: ETH price in USD (with decimals)
- `startedAt`: Round start timestamp
- `updatedAt`: Last update timestamp
- `answeredInRound`: Round in which answer was computed

**Example (TypeScript):**
```typescript
const [roundId, answer, startedAt, updatedAt, answeredInRound] = 
    await contractService.getETHPrice();
// answer: 235000000000 (with 8 decimals = $2350.00)
```

#### decimals

Get the decimal places for the price answer.

```solidity
function decimals() external view returns (uint8)
```

**Returns:** 8 (meaning price is scaled by 10^8)

#### description

Get a description of the price feed.

```solidity
function description() external view returns (string memory)
```

**Returns:** "ETH / USD"

## TypeScript Service API

### ContractService

Location: `src/services/contractService.ts`

```typescript
class ContractService {
  // Initialize with signer and provider
  setSigner(signer: ethers.Signer): void
  setProvider(provider: ethers.Provider): void
  
  // Public methods
  async getETHPrice(): Promise<{
    price: number;
    decimals: number;
    description: string;
  }>
  
  async requestPolicy(location: string): Promise<string>
  
  async getPolicyStatus(): Promise<PolicyData>
  
  async getContractBalance(): Promise<string>
  
  async fundContract(amount: string): Promise<string>
  
  async fulfillWeather(rainfall: number): Promise<string>
  
  async getRainThreshold(): Promise<number>
}
```

#### Example Usage

```typescript
import { contractService } from '@/services/contractService';

// Set up service
contractService.setProvider(provider);
contractService.setSigner(signer);

// Get ETH price
const priceData = await contractService.getETHPrice();
console.log(`ETH Price: $${priceData.price}`);

// Buy policy
const txHash = await contractService.requestPolicy("Farm Location");
console.log(`Policy purchased: ${txHash}`);

// Get policy status
const status = await contractService.getPolicyStatus();
if (status.policyActive) {
  console.log("Policy is active!");
}

// Fund contract
const fundTx = await contractService.fundContract("1.0");

// Trigger payout
const payoutTx = await contractService.fulfillWeather(75);
```

### OracleService

Location: `src/services/oracleService.ts`

```typescript
class OracleService {
  async fetchWeatherData(location: string): Promise<WeatherData>
  storeWeatherData(location: string, data: WeatherData): void
  getWeatherHistory(location: string): WeatherData[]
  formatOracleResponse(weatherData: WeatherData): OracleResponse
  shouldTriggerPayout(rainfall: number, threshold: number): boolean
}
```

### TransactionService

Location: `src/services/transactionService.ts`

```typescript
class TransactionService {
  logTransaction(log: Omit<TransactionLog, 'id'>): TransactionLog
  getTransactions(): TransactionLog[]
  getTransactionsByType(type: TransactionLog['type']): TransactionLog[]
  updateTransactionStatus(id: string, status: string, txHash?: string): void
  clearHistory(): void
  getStatistics(): {total, confirmed, pending, failed, totalAmount}
}
```

## Transaction Types

```typescript
type TransactionType = 
  | 'PolicyBought'      // User purchased policy
  | 'PayoutTriggered'   // Payout issued to user
  | 'WeatherReported'   // Weather data received
  | 'FundsDeposited'    // ETH added to pool

type TransactionStatus = 
  | 'pending'    // Awaiting blockchain confirmation
  | 'confirmed'  // Successfully confirmed
  | 'failed'     // Transaction failed
```

## Error Handling

### Custom Error Types

```typescript
class InsuranceError extends Error {
  code: string;
  details?: any;
}

class ContractError extends InsuranceError
class WalletError extends InsuranceError
class ValidationError extends InsuranceError
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Signer not set" | Web3 not connected | Call `connectWallet()` |
| "Policy already active" | User has existing policy | Wait or clear policy |
| "Premium must be 0.01 ETH" | Wrong payment amount | Send exactly 0.01 ETH |
| "No active policy" | Policy not active | Purchase policy first |
| "Insufficient contract balance" | Pool has no funds | Fund contract first |
| "INSUFFICIENT_FUNDS" | Wallet balance too low | Get test ETH from faucet |

## Gas Estimates

Approximate gas costs on Sepolia:

| Function | Gas | ETH (at 20 Gwei) |
|----------|-----|------------------|
| requestPolicy | 500,000 | ~0.01 ETH |
| fulfillWeather | 500,000 | ~0.01 ETH |
| fundContract | 300,000 | ~0.006 ETH |

## Rate Limits

- Chainlink price feed: Updated every ~10 seconds
- Weather data: Can be fetched every 60 seconds
- Transaction polling: Every 5 seconds
- Balance refresh: Every 30 seconds

## Network Information

**Sepolia Testnet:**
- Chain ID: 11155111
- RPC URL: `https://sepolia.infura.io/v3/{YOUR_KEY}`
- Block Explorer: https://sepolia.etherscan.io/
- Test ETH Faucet: https://sepoliafaucet.com/

## Examples

### Complete Flow: Buy Policy and Check Weather

```typescript
import { contractService } from '@/services/contractService';
import { oracleService } from '@/services/oracleService';
import { transactionService } from '@/services/transactionService';

// 1. Buy policy
const location = "My Farm";
try {
  const txHash = await contractService.requestPolicy(location);
  console.log("Policy purchased:", txHash);
  
  // 2. Wait a moment for blockchain
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. Fetch weather
  const weatherData = await oracleService.fetchWeatherData(location);
  console.log(`Rainfall: ${weatherData.rainfall}mm`);
  
  // 4. Check if payout should trigger
  const threshold = await contractService.getRainThreshold();
  if (oracleService.shouldTriggerPayout(weatherData.rainfall, threshold)) {
    const payoutTx = await contractService.fulfillWeather(
      Math.round(weatherData.rainfall)
    );
    console.log("Payout triggered:", payoutTx);
  }
} catch (error) {
  console.error("Error:", error.message);
}
```

## Limitations

1. **One active policy per address** - Must wait for payout before purchasing new policy
2. **Oracle updates via function call** - Currently requires manual fulfillWeather call
3. **Sepolia testnet only** - Not deployed on mainnet
4. **Fixed parameters** - Premium, payout, and threshold are hardcoded

## Future Enhancements

- Multiple active policies per address
- Chainlink Functions for automatic oracle updates
- Parametric adjustment based on risk
- DAO governance for parameter changes
- Multi-chain deployment
