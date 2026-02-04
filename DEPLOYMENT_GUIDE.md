# 🚀 Farmer Insurance - Deployment & Setup Guide

## Prerequisites

- Node.js 18+ installed
- MetaMask wallet with Sepolia testnet funds
- Git installed
- Hardhat (for contract deployment)

## Part 1: Smart Contract Deployment

### Step 1: Prepare Deployment Environment
```bash
# Navigate to project root
cd c:/Users/parsh/OneDrive/Desktop/para

# Install Hardhat (if not already installed)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Verify Hardhat is set up
npx hardhat --version
```

### Step 2: Create Hardhat Configuration
Create `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const SEPOLIA_RPC = process.env.SEPOLIA_RPC || "https://sepolia.infura.io/v3/YOUR_KEY";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"; // Your wallet private key

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

export default config;
```

### Step 3: Create Deployment Script
Create `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying FarmerInsurance contract...");
  console.log("Deployer address:", deployer.address);

  // Deploy with oracle address (use deployer as initial oracle)
  const FarmerInsurance = await ethers.getContractFactory("FarmerInsurance");
  const insurance = await FarmerInsurance.deploy(deployer.address);
  
  await insurance.waitForDeployment();
  const deployedAddress = await insurance.getAddress();

  console.log("✅ FarmerInsurance deployed to:", deployedAddress);
  console.log("\n--- IMPORTANT: Save These Values ---");
  console.log(`VITE_CONTRACT_ADDRESS=${deployedAddress}`);
  console.log(`VITE_ORACLE_ADDRESS=${deployer.address}`);
  
  // Verify on Etherscan
  console.log("\nVerifying contract on Etherscan...");
  if (process.env.ETHERSCAN_API_KEY) {
    try {
      await insurance.waitForDeployment();
      await ethers.provider.waitForTransaction(
        (await insurance.deploymentTransaction())?.hash || ""
      );
      
      await hre.run("verify:verify", {
        address: deployedAddress,
        constructorArguments: [deployer.address],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification skipped or failed");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Step 4: Compile Smart Contract
```bash
npx hardhat compile
# Output: Artifacts created in artifacts/ directory
```

### Step 5: Deploy to Sepolia
```bash
# Set environment variables
$env:SEPOLIA_RPC = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
$env:PRIVATE_KEY = "your_wallet_private_key_without_0x"
$env:ETHERSCAN_API_KEY = "your_etherscan_api_key"

# Deploy
npx hardhat run scripts/deploy.ts --network sepolia

# Output will show:
# ✅ FarmerInsurance deployed to: 0x123...
# VITE_CONTRACT_ADDRESS=0x123...
# VITE_ORACLE_ADDRESS=0xabc...
```

**⚠️ SAVE THE CONTRACT ADDRESS! You'll need it for the frontend.**

---

## Part 2: Frontend Configuration

### Step 1: Update Environment Variables
Create `.env.local` in project root:

```env
VITE_CONTRACT_ADDRESS=0x... # From deployment output
VITE_ORACLE_ADDRESS=0x... # From deployment output
VITE_NETWORK_ID=11155111 # Sepolia
VITE_NETWORK_NAME=Sepolia
```

### Step 2: Update Constants File
Create/Update `src/config/constants.ts`:

```typescript
export const FARMER_INSURANCE_CONTRACT = {
  address: import.meta.env.VITE_CONTRACT_ADDRESS || '0x...',
  network: 11155111, // Sepolia
  networkName: 'Sepolia',
};

export const SUPPORTED_LOCATIONS = [
  'California Central Valley',
  'France - Aquitaine',
  'India - Punjab',
  'US - Midwest',
  'Africa - Sahel',
  'Australia - Inland',
];

export const WEATHER_TYPES = [
  'ExcessiveRainfall',
  'HeatWave',
  'Hailstorm',
  'Drought',
  'Frost',
  'MultiHazard',
];
```

### Step 3: Install Dependencies
```bash
npm install

# Verify installation
npm list ethers react react-dom
```

### Step 4: Run Development Server
```bash
npm run dev

# Output:
#   VITE v4.4.9  ready in 123 ms
#   ➜  Local:   http://localhost:5173/
#   ➜  press h to show help
```

---

## Part 3: Testing the System

### Test 1: Connect Wallet
1. Navigate to http://localhost:5173
2. Click "💼 Connect Wallet"
3. Approve MetaMask connection
4. Verify account displays (e.g., "✓ 0x123...4567")

### Test 2: AI Premium Calculation
1. Click "Insurance" in navigation
2. Enter location: "India - Punjab"
3. Select "🏜️ Drought"
4. Set base premium: 0.5
5. Click "📊 Get Quote"
6. Verify:
   - Risk Multiplier: 1.4x
   - Final Premium: 0.7 ETH
   - Confidence: ~92%

### Test 3: Purchase Policy
1. After getting quote
2. Click "✅ Confirm & Purchase Policy"
3. Approve transaction in MetaMask
4. Wait for confirmation
5. Check "My Policies" tab
6. Verify policy shows:
   - Location: "India - Punjab"
   - Status: "🟢 Active"
   - Premium: 0.5 ETH
   - Payout: 1.0 ETH

### Test 4: Different Locations
Test premium calculations for different risk levels:

```javascript
// In browser console (InsurancePage.tsx)
import { aiPremiumService } from './services/aiPremiumService';

// Low risk
aiPremiumService.calculatePremium({
  location: 'California Central Valley',
  weatherType: 'Drought',
  baselineAmount: '0.5'
});
// Expect: riskMultiplier ≈ 0.9x

// Medium risk
aiPremiumService.calculatePremium({
  location: 'India - Punjab',
  weatherType: 'Drought',
  baselineAmount: '0.5'
});
// Expect: riskMultiplier ≈ 1.4x

// High risk
aiPremiumService.calculatePremium({
  location: 'Africa - Sahel',
  weatherType: 'Drought',
  baselineAmount: '0.5'
});
// Expect: riskMultiplier ≈ 1.9x
```

### Test 5: Contract Interaction
```bash
# Open Sepolia Etherscan
# Go to: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

# You should see:
# ✓ Contract Code
# ✓ Transactions (your purchase)
# ✓ Events (PolicyPurchased)
```

---

## Part 4: Oracle Setup

### Option A: Manual Oracle Testing
```javascript
// In hardhat console
npx hardhat console --network sepolia

// Then in console:
const insurance = await ethers.getContractAt(
  'FarmerInsurance',
  '0x...' // Your contract address
);

// Fund contract for payouts
const tx1 = await signer.sendTransaction({
  to: '0x...',
  value: ethers.parseEther("2")
});
await tx1.wait();

// Submit weather data
const tx2 = await insurance.fulfillWeatherData(
  '0x...' // farmer address
  'India - Punjab', // MUST match policy location!
  10, // rainfall < 20mm (drought trigger)
  35, // temperature
  50, // wind speed
  false // no frost
);
await tx2.wait();

// Check payout was executed
const policy = await insurance.getPolicy('0x...');
console.log('Policy paid:', policy.paid); // Should be true
```

### Option B: Chainlink Oracle Integration (Future)
```typescript
// In your oracle service
import { ChainlinkWeatherOracle } from '@chainlink/oracle-contracts';

const oracle = new ChainlinkWeatherOracle({
  contract: FARMER_INSURANCE_ADDRESS,
  apiKey: process.env.CHAINLINK_API_KEY,
});

// Schedule automatic weather reports
await oracle.scheduleWeatherReport({
  location: 'India - Punjab',
  frequency: 'hourly', // or 'daily'
  fallbackOracleAddress: FALLBACK_ORACLE,
});
```

---

## Part 5: Production Deployment

### Build for Production
```bash
npm run build

# Output:
# ✓ 1234 modules transformed.
# ✓ dist/index.html
# ✓ dist/assets/...
```

### Deploy to Vercel
```bash
npm install -g vercel

vercel
# Follow prompts:
# ? Set up and deploy "~/path/to/project"? [Y/n] y
# ? Which scope? [your-team]
# ? Link to existing project? [y/N] n
# ? What's your project's name? parashield-insurance
# ? In which directory? ./
# ? Want to override the settings? [y/N] n

# After deployment:
# ✅ Production: https://parashield-insurance.vercel.app
```

### Deploy to Netlify
```bash
npm install -g netlify-cli

netlify init
# Follow prompts
# Deploy: netlify deploy --prod
```

### Update Environment Variables in Hosting
Add to Vercel/Netlify dashboard:
```
VITE_CONTRACT_ADDRESS=0x...
VITE_ORACLE_ADDRESS=0x...
```

---

## Part 6: Monitoring & Maintenance

### View Contract on Block Explorer
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

Monitor:
- ✓ Transaction history
- ✓ Emitted events
- ✓ Contract balance
- ✓ Method calls

### Track Policies
```javascript
// Get all policies for a location
const policies = await insurance.getPoliciesByLocation('India - Punjab');
console.log(`Policies in Punjab: ${policies.length}`);

// Get contract stats
const stats = await insurance.getContractStats();
console.log('Total Premiums:', ethers.formatEther(stats.premiumsCollected));
console.log('Total Payouts:', ethers.formatEther(stats.payoutsExecuted));
console.log('Contract Balance:', ethers.formatEther(stats.contractBalance));
```

### Handle Contract Upgrades
```solidity
// To update oracle (owner-only)
await insurance.updateOracle(newOracleAddress);

// To withdraw balance (owner-only)
await insurance.withdrawContractBalance();
```

---

## Troubleshooting

### Issue: "Wrong Network" Error
**Solution:** Add Sepolia to MetaMask
```
Network Name: Sepolia
RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
Chain ID: 11155111
Currency Symbol: ETH
```

### Issue: Contract Not Found at Address
**Cause:** Deployed to different network
**Solution:** Check deployment output, verify contract address on Etherscan

### Issue: "Insufficient Funds" Error
**Cause:** Not enough ETH for transaction
**Solution:** Get Sepolia testnet ETH from:
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia

### Issue: Location Verification Failed
**Cause:** Exact location string doesn't match
**Solution:** Use exact location from policy
- Wrong: "India Punjab" vs "India - Punjab"
- Right: "India - Punjab" vs "India - Punjab"

### Issue: Premium Quote Shows "Unknown Location"
**Cause:** Location not in AI database
**Solution:** Use supported locations or add new one to database

---

## Success Checklist

- [ ] Smart contract compiled without errors
- [ ] Contract deployed to Sepolia
- [ ] Contract address saved in `.env.local`
- [ ] Frontend builds without errors
- [ ] `npm run dev` starts successfully
- [ ] Can connect MetaMask wallet
- [ ] Insurance page loads at `/insurance`
- [ ] Can get premium quote
- [ ] Can purchase policy
- [ ] Transaction appears on Etherscan
- [ ] Policy visible in "My Policies"
- [ ] Contract shows correct balance

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Smart Contract
npx hardhat compile    # Compile contract
npx hardhat deploy     # Deploy to network
npx hardhat test       # Run tests
npx hardhat verify     # Verify on Etherscan

# Useful Queries
npx hardhat console --network sepolia
# Then query contract state
```

---

## Support

For deployment issues:
1. Check Etherscan for transaction details
2. Review console errors in browser DevTools
3. Verify contract address is correct
4. Ensure MetaMask is on Sepolia testnet
5. Check `.env.local` for correct addresses

Ready to launch! 🚀
