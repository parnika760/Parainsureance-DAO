# Quick Start Guide - ParaShield

Get up and running with ParaShield in 5 minutes!

## 1️⃣ Prerequisites (2 minutes)

- ✅ MetaMask installed ([install](https://metamask.io/))
- ✅ Sepolia testnet ETH ([get free](https://sepoliafaucet.com/))
- ✅ Node.js 16+ ([download](https://nodejs.org/))

## 2️⃣ Install & Start (2 minutes)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in browser
```

## 3️⃣ Connect Wallet (1 minute)

1. Click **"💼 Connect Wallet"** button
2. Select account in MetaMask popup
3. Verify **Sepolia testnet** is selected
4. Click **"Connect"**

## Done! ✅

You should now see:
- Your wallet address in the header
- ETH price from Chainlink oracle
- Policy status
- Pool liquidity

---

## Try These Features

### 🛡️ Buy a Policy (0.01 ETH)
1. Enter farm location (e.g., "My Farm")
2. Click **"Purchase Policy"**
3. Approve in MetaMask
4. Wait for confirmation

### ⛈️ Trigger Payout
1. Click **"Check & Trigger Payout"**
2. App checks simulated weather
3. If rainfall ≥ 50mm, payout triggers
4. Confirm transaction

### 💎 Fund Pool
1. Enter amount (e.g., 0.1 ETH)
2. Click **"Fund Pool"**
3. Approve transaction
4. Earn 15% annual return

### 📤 View Transactions
- See all transactions in history
- Click Etherscan link to verify on blockchain

---

## Need Help?

| Issue | Solution |
|-------|----------|
| "Not on Sepolia" | Switch to Sepolia in MetaMask |
| "Insufficient funds" | Get test ETH from [faucet](https://sepoliafaucet.com/) |
| "Transaction pending" | Wait or speed up in MetaMask |
| "Policy already active" | Policy still active, can't buy another |

---

## Important Files

- 📄 `README.md` - Full project overview
- 📄 `SETUP.md` - Detailed setup instructions
- 📄 `DEVELOPMENT.md` - Architecture & development
- 📄 `API.md` - Smart contract API reference
- 📄 `INTEGRATION_SUMMARY.md` - All changes made

---

## Smart Contract Details

```
Network:     Sepolia Testnet
Contract:    0x5Cea979df129614c09C6E7AA45b568B37b740726
Premium:     0.01 ETH
Payout:      0.01 ETH
Threshold:   50mm rainfall
Oracle Feed: 0x694AA1769357215DE4FAC081bf1f309aDC325306
```

---

## Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript
npm run lint         # Run linter
```

---

## Project Structure

```
src/
├── components/     # UI components (Header, Dashboard, etc.)
├── services/       # Contract & Oracle services
├── context/        # Web3 provider & state
├── pages/          # Page components
├── config/         # Configuration & constants
├── utils/          # Helper functions & error handling
├── types/          # TypeScript interfaces
└── App.tsx         # Root component
```

---

## Key Features

✅ **MetaMask Integration** - Connect your wallet in one click  
✅ **Real-time Prices** - ETH/USD from Chainlink oracle  
✅ **Smart Contracts** - Direct blockchain interaction  
✅ **Parametric Insurance** - Automated payouts based on weather  
✅ **Transaction Tracking** - All interactions logged with Etherscan links  
✅ **Responsive Design** - Works on mobile, tablet, desktop  
✅ **Full TypeScript** - Type-safe throughout  

---

## Next Steps

1. **Explore the code**: Check out `src/components/` and `src/services/`
2. **Try all features**: Buy policy, check weather, fund pool
3. **Read docs**: See `DEVELOPMENT.md` for architecture details
4. **Deploy**: Build and deploy to Vercel/Netlify when ready

---

## Common Questions

**Q: Do I need real ETH?**  
A: No! Use testnet ETH from the [Sepolia faucet](https://sepoliafaucet.com/) - it's free!

**Q: Is my wallet safe?**  
A: Yes! MetaMask handles all signing. We never see your private keys.

**Q: How do I see transactions on-chain?**  
A: Click the Etherscan link in the Transaction History section.

**Q: What happens if I click "Trigger Payout"?**  
A: The app simulates weather data. If rainfall ≥ 50mm, payout triggers automatically.

**Q: Can I buy multiple policies?**  
A: Currently, one policy per address at a time. Wait for payout to claim another.

---

## Useful Links

- 🔗 [Sepolia Faucet](https://sepoliafaucet.com/) - Get test ETH
- 🔗 [Sepolia Explorer](https://sepolia.etherscan.io/) - View transactions
- 🔗 [MetaMask](https://metamask.io/) - Web3 wallet
- 🔗 [Ethers.js Docs](https://docs.ethers.org/) - Blockchain library
- 🔗 [Chainlink Docs](https://docs.chain.link/) - Oracle reference

---

## Troubleshooting

### MetaMask not showing Sepolia?
1. Open MetaMask
2. Go to Settings → Advanced
3. Enable "Show test networks"
4. Sepolia should now appear

### Transaction stuck pending?
1. Go to MetaMask Activity tab
2. Click the pending transaction
3. Click "Speed up"
4. Confirm with higher gas price

### Contract call failing?
1. Ensure active policy for weather check
2. Ensure contract has balance for payouts
3. Check browser console for error details

---

## Tips & Tricks

💡 Keep the browser console open (F12) to see detailed logs  
💡 Transactions are saved in localStorage - survives page reload  
💡 Use network selector to switch between chains easily  
💡 Check Etherscan to verify transactions are real  

---

## Ready to Build?

This project is fully set up for development:
- ✅ React 18 + TypeScript
- ✅ Tailwind CSS styling
- ✅ Web3 integration (ethers.js)
- ✅ Service-based architecture
- ✅ Full documentation

Happy coding! 🚀

---

**Questions?** Check `DEVELOPMENT.md` for detailed documentation.  
**Found a bug?** Check browser console and `DEVELOPMENT.md` troubleshooting section.
