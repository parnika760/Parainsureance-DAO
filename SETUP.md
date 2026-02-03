# Setup Guide - ParaShield

## Prerequisites

- **Node.js**: v16 or higher ([download](https://nodejs.org/))
- **npm or yarn**: Comes with Node.js
- **MetaMask**: Browser extension ([install](https://metamask.io/))
- **Sepolia Test ETH**: Get from [faucet](https://sepoliafaucet.com/)

## Step 1: Installation

```bash
# Navigate to project directory
cd para

# Install dependencies
npm install

# Or if using yarn
yarn install
```

## Step 2: Setup MetaMask

1. **Install MetaMask**
   - Go to https://metamask.io/
   - Click "Install MetaMask for [Browser]"
   - Add extension to your browser

2. **Create/Import Wallet**
   - Open MetaMask
   - Create new wallet or import existing seed phrase
   - **Important**: Save your seed phrase securely

3. **Switch to Sepolia Testnet**
   - Click network dropdown in MetaMask
   - Select "Sepolia test network"
   - If not visible, enable "Show test networks" in settings

## Step 3: Get Test ETH

1. **Go to Sepolia Faucet**
   - Visit https://sepoliafaucet.com/
   - OR https://www.infura.io/faucet/sepolia

2. **Request Test ETH**
   - Enter your MetaMask wallet address
   - Complete verification if required
   - Wait for ETH to appear (usually 1-2 minutes)

## Step 4: Start Development Server

```bash
# Start the development server
npm run dev

# Server will run at http://localhost:5173
```

## Step 5: Connect to Application

1. **Open Application**
   - Go to http://localhost:5173 in your browser
   - You should see the ParaShield dashboard

2. **Connect Wallet**
   - Click "💼 Connect Wallet" button
   - MetaMask popup will appear
   - Select account and click "Connect"

3. **Verify Connection**
   - Button should show your address (e.g., "✓ 0x1234...5678")
   - Account balance should display
   - ETH price should update from Chainlink

## Step 6: Test Features

### Buy a Policy
1. Enter farm location (e.g., "My Farm")
2. Click "🛡️ Purchase Policy"
3. Approve transaction in MetaMask
4. Wait for confirmation

### Check Weather & Trigger Payout
1. Click "⛈️ Check & Trigger Payout"
2. App simulates weather data
3. If rainfall >= 50mm, payout triggers
4. Confirm transaction in MetaMask

### Fund the Pool
1. Enter amount (e.g., 0.1 ETH)
2. Click "💰 Fund Pool"
3. Approve transaction
4. Funds added to contract

### View Transactions
- Check "Transaction History" section
- Click Etherscan link to view on blockchain
- Verify status changes from Pending → Confirmed

## Troubleshooting

### MetaMask Not Detecting Sepolia

**Solution:**
1. Open MetaMask settings
2. Go to Settings → Advanced
3. Enable "Show test networks"
4. Sepolia should now appear in network dropdown

### Transaction Keeps Pending

**Solution:**
1. In MetaMask, go to Activity tab
2. Click pending transaction
3. Click "Speed up" to increase gas price
4. Or wait 5-10 minutes for confirmation

### "Insufficient Funds" Error

**Solution:**
1. Get more Sepolia test ETH from faucet
2. Wait for balance to update in MetaMask
3. Try transaction again

### Wrong Network Error

**Solution:**
1. Make sure MetaMask is on "Sepolia test network"
2. Wallet address should match in app
3. Refresh page if needed

### Contract Call Failed

**Solution:**
1. Ensure you have active policy for certain operations
2. Check contract balance is sufficient for payouts
3. Verify location string is not empty

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint
```

## Important Configuration

Edit `src/config/constants.ts` to update:

- Smart contract addresses
- Chainlink oracle addresses
- Network configuration
- Gas limits
- UI refresh intervals

## File Structure

```
src/
├── components/          # React components
├── context/            # Web3Context provider
├── pages/              # Page components
├── services/           # Contract & Oracle services
├── config/             # Configuration
├── utils/              # Helper functions
├── types/              # TypeScript types
├── App.tsx             # Root component
└── main.tsx            # Entry point
```

## Common Issues & Solutions

### Port 5173 Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5173   # Windows
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Check TypeScript
npm run type-check

# Run linter
npm run lint

# Clean and rebuild
rm -rf dist
npm run build
```

## Next Steps

1. **Explore the Code**: Check out the components and services
2. **Try Features**: Test all functionality with test ETH
3. **Read Documentation**: See DEVELOPMENT.md for architecture
4. **Deploy**: Build and deploy to Vercel, Netlify, or IPFS

## Security Notes

⚠️ **Never**:
- Share your seed phrase with anyone
- Import seed phrase in unsafe environments
- Copy private keys to untrusted websites
- Grant permissions to unknown contracts

✅ **Always**:
- Use testnet for development
- Review transactions before confirming
- Keep MetaMask updated
- Verify contract addresses before interaction

## Support

For issues or questions:
1. Check this troubleshooting guide
2. Review DEVELOPMENT.md for architecture details
3. Check browser console for error messages
4. Open an issue on GitHub

## Resources

- **Ethers.js Docs**: https://docs.ethers.org/
- **React Documentation**: https://react.dev/
- **Chainlink Docs**: https://docs.chain.link/
- **Sepolia Network**: https://www.alchemy.com/layer2/sepolia
- **Tailwind CSS**: https://tailwindcss.com/

## Next: Running the Application

Once setup is complete, your development environment is ready!

```bash
npm run dev
```

The application will be available at http://localhost:5173

Happy coding! 🚀
