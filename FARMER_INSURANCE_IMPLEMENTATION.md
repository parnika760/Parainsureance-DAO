# 🌾 Farmer Insurance System - Implementation Guide

## Overview

A complete parametric insurance platform for farmers with:
- **AI-Powered Premium Calculation** based on location risk assessment
- **Location-Based Claims** verification
- **Parametric Payouts** triggered automatically by weather conditions
- **Governance Ready** architecture
- **Web3 Integration** with Ethereum smart contracts

## Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│                   FARMER INTERFACE                      │
├─────────────────────────────────────────────────────────┤
│  1. Farmer enters location (e.g., "India - Punjab")    │
│  2. Selects coverage type (Drought, Hailstorm, etc)   │
│  3. Clicks "Get Quote"                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   AI PREMIUM SERVICE        │
        ├────────────────────────────┤
        │ • Risk Database Query       │
        │ • Calculate Risk Score      │
        │ • Apply Weather Multiplier  │
        │ • Return Premium Quote      │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   PREMIUM QUOTE DISPLAY    │
        ├────────────────────────────┤
        │ • Base Premium             │
        │ • Risk Multiplier          │
        │ • Final Premium (ETH)      │
        │ • Risk Factors             │
        │ • AI Confidence %          │
        └────────────┬────────────────┘
                     │
                     ▼ (Farmer clicks "Buy Policy")
        ┌────────────────────────────┐
        │  SMART CONTRACT PURCHASE   │
        ├────────────────────────────┤
        │ purchasePolicy():           │
        │ • Store farmer address      │
        │ • Store location            │
        │ • Store weather type        │
        │ • Store premium paid        │
        │ • Calculate 2x payout       │
        │ • Mark policy ACTIVE        │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   ORACLE WEATHER FEED      │
        ├────────────────────────────┤
        │ Reports weather for        │
        │ specific location           │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ fulfillWeatherData():       │
        ├────────────────────────────┤
        │ 1. Verify location match   │
        │ 2. Check weather triggers  │
        │ 3. If disaster:            │
        │    - Mark policy PAID      │
        │    - Execute payout        │
        │    - Emit event            │
        └────────────────────────────┘
```

## System Components

### 1. **AI Premium Service** (`src/services/aiPremiumService.ts`)

Calculates personalized insurance premiums based on location and weather risks.

#### Key Features:
- **Geographic Risk Database** with 6+ predefined locations
- **Parametric Premium Calculation** (not claim-based, automatic)
- **Risk Multipliers** for different weather types
- **Confidence Scoring** (0-100%)

#### Supported Locations:
```
📍 Low Risk
  • California Central Valley - 25 risk score
  • France - Aquitaine - 30 risk score

📍 Medium Risk
  • India - Punjab - 55 risk score
  • US - Midwest - 60 risk score

📍 High Risk
  • Africa - Sahel - 80 risk score
  • Australia - Inland - 75 risk score
```

#### Weather Types & Multipliers:
```
🌧️  Excessive Rainfall: 1.1x - 1.6x
🌡️  Heat Wave: 1.0x - 1.3x
🌨️  Hailstorm: 1.2x - 2.0x
🏜️  Drought: 1.1x - 1.9x
❄️  Frost: 1.1x - 1.7x
⚡ Multi-Hazard: 1.4x - 2.1x
```

#### Example Calculation:
```typescript
const quote = aiPremiumService.calculatePremium({
  location: "India - Punjab",
  weatherType: "Drought",
  baselineAmount: "0.5"
});

// Result:
// Base Premium: 0.5 ETH
// Risk Multiplier: 1.4x (Punjab has high drought risk)
// Final Premium: 0.7 ETH
// Confidence: 92%
```

### 2. **Smart Contract** (`contracts/FarmerInsurance.sol`)

Enhanced Solidity contract with location-verified claims.

#### Key Functions:

**Purchase Policy:**
```solidity
function purchasePolicy(
    string calldata location,
    WeatherType weatherType
) external payable
```
- Farmer enters location exactly as stored in policy
- Premium sent as msg.value
- Policy marked ACTIVE
- Payout set to 2x premium (parametric)

**Fulfill Weather Data (Oracle):**
```solidity
function fulfillWeatherData(
    address farmer,
    string calldata reportedLocation,
    uint256 rainfall,
    int256 temperature,
    uint256 windSpeed,
    bool frostDetected
) external onlyOracle
```
- **Location Verification:** Must match policy location (reverts if mismatch)
- **Weather Evaluation:** Checks against policy type triggers
- **Automatic Payout:** If disaster detected, pays 2x premium

**Location Verification:**
```solidity
function verifyClaimLocation(
    address farmer,
    string calldata claimLocation
) external view returns (bool)
```
- Ensures claims only from registered location

### 3. **Frontend Components**

#### Insurance Page (`src/pages/InsurancePage.tsx`)

Two-tab interface for farmers:

**Tab 1: Buy Policy**
1. Location input (with autocomplete suggestions)
2. Coverage type selector
3. Base premium input (default 0.5 ETH)
4. Quote button
5. Quote display with breakdown
6. Confirm & purchase button

**Tab 2: Manage Policies**
1. Active policy display
2. Policy details (location, type, premium, payout)
3. How claims work explanation
4. Empty state with CTA

#### Key Features:
- Real-time premium calculation
- Risk factor display
- AI confidence percentage
- Location-verified claims explanation
- Responsive design
- Transaction status feedback

### 4. **Contract Service** (`src/services/contractService.ts`)

Web3 integration layer with extended methods.

#### Insurance-Specific Methods:
```typescript
// Purchase policy
async purchasePolicy(
  location: string,
  weatherType: string,
  premiumWei: string,
  signer: Signer
): Promise<string>

// Get policy details
async getPolicy(
  farmerAddress: string,
  signer: Signer
): Promise<InsurancePolicy>

// Verify claim location
async verifyClaimLocation(
  farmerAddress: string,
  claimLocation: string,
  signer: Signer
): Promise<boolean>

// Get policies by location
async getPoliciesByLocation(
  location: string,
  signer: Signer
): Promise<string[]>

// Get contract statistics
async getContractStats(
  signer: Signer
): Promise<{
  premiumsCollected: string;
  payoutsExecuted: string;
  contractBalance: string;
}>
```

### 5. **Types** (`src/types/contracts.ts`)

```typescript
interface InsurancePolicy {
  farmer: string;
  location: string;
  weatherType: string;
  premiumPaid: string;
  payoutAmount: string;
  active: boolean;
  paid: boolean;
  purchaseTime: number;
  claimTime: number;
}

interface PremiumQuote {
  location: string;
  weatherType: string;
  basePremium: string;
  riskMultiplier: number;
  finalPremium: string;
  riskFactors: string[];
  confidence: number;
}
```

## User Flow

### Buying Insurance

1. **Connect Wallet** → Farmer authenticates with MetaMask
2. **Navigate to Insurance** → `/insurance` route
3. **Enter Location** → Type "India - Punjab" or select from suggestions
4. **Select Coverage** → Choose weather type (Drought, Hailstorm, etc.)
5. **Adjust Premium** → Optional: change base amount
6. **Get Quote** → AI calculates premium based on risk
7. **Review Quote** → See breakdown, risk factors, confidence score
8. **Confirm Purchase** → Click "Buy Policy" button
9. **Sign Transaction** → Approve in MetaMask
10. **Policy Active** → View in "My Policies" tab

### Claiming Insurance

1. **Weather Event Occurs** → Natural disaster at registered location
2. **Oracle Reports Data** → Weather oracle submits data for location
3. **Location Verified** → Smart contract checks reported location vs policy location
4. **Triggers Checked** → Contract evaluates if weather meets policy thresholds
5. **Automatic Payout** → If triggered, 2x premium sent to farmer instantly
6. **No Claims Forms** → Parametric insurance = no paperwork!

## Setup & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```
VITE_CONTRACT_ADDRESS=0x... # Deployed FarmerInsurance contract
VITE_ORACLE_ADDRESS=0x...   # Chainlink or custom oracle
VITE_SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_KEY
```

### 3. Deploy Smart Contract
```bash
# Using Hardhat
npx hardhat compile
npx hardhat deploy --network sepolia
```

### 4. Update Constants
```typescript
// src/config/constants.ts
export const FARMER_INSURANCE_ADDRESS = '0x...'; // Your deployed contract
```

### 5. Run Frontend
```bash
npm run dev
# http://localhost:5173
```

## Testing

### Test Premium Calculation
```typescript
import { aiPremiumService } from './services/aiPremiumService';

// Test 1: Low risk location
const quote1 = aiPremiumService.calculatePremium({
  location: 'California Central Valley',
  weatherType: 'Drought',
  baselineAmount: '0.5'
});
console.log(quote1); // Should have low multiplier (~1.1x)

// Test 2: High risk location
const quote2 = aiPremiumService.calculatePremium({
  location: 'Africa - Sahel',
  weatherType: 'Drought',
  baselineAmount: '0.5'
});
console.log(quote2); // Should have high multiplier (~1.9x)

// Test 3: Unknown location
const quote3 = aiPremiumService.calculatePremium({
  location: 'New York City',
  weatherType: 'Hailstorm',
  baselineAmount: '0.5'
});
console.log(quote3); // Should use default premium with warning
```

### Test Smart Contract

```javascript
// Using Hardhat test file
const { expect } = require("chai");

describe("FarmerInsurance", function () {
  
  it("Should purchase policy with correct location", async function () {
    const tx = await insurance.purchasePolicy("India - Punjab", 3, {
      value: ethers.parseEther("0.5")
    });
    const receipt = await tx.wait();
    
    const policy = await insurance.getPolicy(farmer.address);
    expect(policy.location).to.equal("India - Punjab");
    expect(policy.weatherType).to.equal(3); // Drought enum
    expect(policy.active).to.be.true;
  });

  it("Should reject claim from wrong location", async function () {
    await insurance.purchasePolicy("India - Punjab", 3, {
      value: ethers.parseEther("0.5")
    });
    
    // Try to claim from different location
    await expect(
      insurance.fulfillWeatherData(
        farmer.address,
        "India - Maharashtra", // Wrong location!
        100,
        35,
        50,
        false
      )
    ).to.be.revertedWith("Location mismatch");
  });

  it("Should payout when weather triggers match", async function () {
    // Setup
    await insurance.purchasePolicy("India - Punjab", 3, { // Drought
      value: ethers.parseEther("0.5")
    });
    
    const initialBalance = await ethers.provider.getBalance(farmer.address);
    
    // Trigger drought (rainfall < 20mm)
    await oracle.fulfillWeatherData(
      farmer.address,
      "India - Punjab",
      10, // 10mm rainfall (below threshold)
      35,
      50,
      false
    );
    
    const finalBalance = await ethers.provider.getBalance(farmer.address);
    expect(finalBalance).to.be.gt(initialBalance); // Received payout
  });
});
```

## Smart Contract Events

```solidity
event PolicyPurchased(
  address indexed farmer,
  string location,
  WeatherType weatherType,
  uint256 premium,
  uint256 payoutAmount
);

event LocationClaimVerified(
  address indexed farmer,
  string location,
  bool verified
);

event WeatherEvaluated(
  address indexed farmer,
  string location,
  uint256 rainfall,
  int256 temperature,
  uint256 windSpeed,
  bool frostDetected
);

event PayoutExecuted(
  address indexed farmer,
  string location,
  uint256 payoutAmount
);
```

## Security Considerations

### 1. Location Verification
- ✅ Exact string matching (case-sensitive)
- ✅ Prevents cross-location fraud
- ✅ Prevents farmer from claiming for someone else's region

### 2. Oracle Security
- 🔐 `onlyOracle` modifier restricts weather data submission
- 🔐 Oracle address updateable only by owner
- 🔐 Implement Chainlink VRF for decentralized validation

### 3. Payout Security
- 🔐 Use `call` instead of `transfer` (prevents reentrancy)
- 🔐 Check-Effects-Interactions pattern
- 🔐 Balance verification before payout
- 🔐 Policy marked as PAID before transfer

### 4. Frontend Security
- ✅ Wallet connection required
- ✅ Amount validation before submission
- ✅ Location string sanitization
- ✅ Transaction confirmation checks

## Future Enhancements

### Phase 2:
- [ ] Integration with Chainlink Price Feeds
- [ ] Multi-signature oracle validation
- [ ] DAO governance for premium updates
- [ ] Reinsurance layer

### Phase 3:
- [ ] Real satellite weather data integration
- [ ] Machine learning risk scoring
- [ ] Automated underwriting
- [ ] Secondary market trading

### Phase 4:
- [ ] Cross-chain insurance pools
- [ ] Decentralized oracle consensus
- [ ] Community voting on claims
- [ ] Native insurance token

## References

- **Smart Contract:** [FarmerInsurance.sol](../contracts/FarmerInsurance.sol)
- **Frontend:** [InsurancePage.tsx](../src/pages/InsurancePage.tsx)
- **AI Service:** [aiPremiumService.ts](../src/services/aiPremiumService.ts)
- **Contract Service:** [contractService.ts](../src/services/contractService.ts)

## Support

For issues or questions:
1. Check the [FAQ](./FAQ.md)
2. Review test cases
3. Check contract events in blockchain explorer
4. Verify location spelling matches exactly
