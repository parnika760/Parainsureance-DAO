# ParaShield - Parametric Insurance DAO

A modern, decentralized parametric insurance platform for farmers using smart contracts, Chainlink oracles, and Web3 technology.

## Features

✅ **Smart Contract Integration** - Direct blockchain interaction with Insurance contracts
✅ **Chainlink Price Feeds** - Real-time ETH/USD price data
✅ **Parametric Insurance** - Automated payouts based on weather data
✅ **Dashboard** - Monitor ETH prices, policy status, and pool liquidity
✅ **Policy Management** - Buy policies with location-based parameters
✅ **Weather Tracking** - Automatic payout triggers based on rainfall
✅ **Pool Funding** - Contribute ETH to earn returns
✅ **Transaction History** - Track all blockchain interactions
✅ **Web3 Integration** - MetaMask wallet connection
✅ **Responsive Design** - Mobile, tablet, and desktop optimized
✅ **Glassmorphism UI** - Modern aesthetic with emerald & electric blue accents
✅ **Dark Mode** - Professional FinTech styling

## Project Structure

```
src/
├── components/
│   ├── Header.tsx                # Navigation & wallet button
│   ├── StatsOverview.tsx         # Real-time stats (ETH price, policy status, pool)
│   ├── ActionCenter.tsx          # Policy purchase, weather check, pool funding
│   └── TransactionHistory.tsx    # Contract interactions log
├── context/
│   └── Web3Context.tsx           # Web3 provider & state management
├── pages/
│   ├── Dashboard.tsx             # Main dashboard layout
│   └── Policies.tsx              # Policy details page
├── services/
│   ├── contractService.ts        # Smart contract interaction layer
│   ├── oracleService.ts          # Weather oracle integration
│   └── transactionService.ts     # Transaction logging & history
├── config/
│   └── constants.ts              # Configuration & constants
├── utils/
│   ├── helpers.ts                # Utility functions
│   └── errors.ts                 # Error handling & logging
├── types/
│   └── contracts.ts              # TypeScript interfaces
├── App.tsx                       # Root component with routing
├── main.tsx                      # Entry point
└── index.css                     # Global styles & Tailwind
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide-React** - Icon library
- **Ethers.js v6** - Web3 interaction
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing

## Smart Contracts

### Deployed Contracts (Sepolia Testnet)

**Insurance Contract**: `0xE529a659d1de4025A4044E6472C26B6224dADCb4`

**Chainlink ETH/USD Feed**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`

### Contract Features

- **Premium**: 0.01 ETH
- **Payout**: 0.01 ETH
- **Rain Threshold**: 50mm
- **Oracle-based Payouts**: Automatic triggers when rainfall exceeds threshold

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (get from [faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone repository
git clone <repository-url>
cd para

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

## Smart Contract Integration

The frontend is ready to interact with these contract functions:

```solidity
function buyPolicy() payable external
function getETHPrice() view external returns (uint256)
function payout() external
function policyActive() public view returns (bool)
function policyPaid() public view returns (bool)
```

### Integration Steps

1. **Update contract addresses** in `src/context/Web3Context.tsx`
2. **Add contract ABI** files to `src/contracts/`
3. **Implement contract calls** in component action handlers:
   - `ActionCenter.tsx` - `handleBuyPolicy()` and `handleTriggerPayout()`
   - `StatsOverview.tsx` - Fetch real ETH price and liquidity data
   - `TransactionHistory.tsx` - Query contract events

Example integration in ActionCenter:

```typescript
const buyPolicy = async () => {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );
  
  const tx = await contract.buyPolicy({
    value: ethers.parseEther('0.01')
  });
  
  await tx.wait();
};
```

## Key Components

### Header
- ParaShield branding
- Navigation links (Dashboard, Policies, Governance, Docs)
- Wallet connection status
- Mobile responsive menu

### StatsOverview
- **ETH Price** - Chainlink Oracle data
- **Policy Status** - Active/Inactive
- **Pool Liquidity** - Available funds

### ActionCenter
Two-column layout:
- **Purchase Policy** - 0.01 ETH cost, annual coverage
- **Claim & Payout** - Disaster status & payout triggers

### TransactionHistory
- Recent contract interactions
- Status indicators (Completed, Pending, Failed)
- Transaction types (Policy, Payout, Claim)

## Styling Features

- **Glassmorphism** - Frosted glass effect on cards
- **Gradient Background** - Dark-to-darker gradient
- **Responsive Grid** - Auto-adjusts for mobile/desktop
- **Color Scheme**:
  - Primary: Emerald Green (#34d399)
  - Accent: Electric Blue (#3b82f6)
  - Background: Dark Navy (#0f1419)

## Environment Variables

Create a `.env.local` file (if needed):

```
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
VITE_CONTRACT_ADDRESS=0x...
```

## Wallet Connection

The app uses MetaMask's `window.ethereum` provider. When users click "Connect Wallet":

1. MetaMask injection confirmation
2. Account selection
3. Provider/Signer initialization
4. Account display in header

## Testing

Manual testing checklist:
- [ ] Wallet connection/disconnection
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Button state handling (loading, disabled)
- [ ] Transaction flow (buy policy, trigger payout)
- [ ] Error handling & user feedback

## Future Enhancements

- [ ] Real Chainlink Oracle integration
- [ ] Event listeners for real-time updates
- [ ] Toast notifications for transaction feedback
- [ ] Advanced charts & analytics
- [ ] Governance voting interface
- [ ] Multi-chain support

## License

MIT

## Support

For issues or questions, refer to the documentation or create an issue in the repository.
