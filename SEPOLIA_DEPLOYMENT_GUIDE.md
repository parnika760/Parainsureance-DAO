# Sepolia Testnet Deployment Guide

## Overview
This guide covers deploying the GovernanceVoting smart contract to Sepolia testnet and configuring the frontend to interact with it.

## Prerequisites
- MetaMask or Web3 wallet browser extension
- Sepolia testnet ETH for gas fees
- Remix IDE access (https://remix.ethereum.org)
- Infura API key (https://www.infura.io/)

## Step 1: Get Sepolia Testnet ETH

### Option A: Using Faucets
1. Open https://sepoliafaucet.com or https://www.infura.io/faucet/sepolia
2. Connect your MetaMask wallet
3. Request test ETH (typically 0.5-2 ETH)
4. Wait for transaction to confirm (usually within seconds)

### Option B: Using Discord Faucet
1. Join Ethereum Foundation Discord
2. Go to #faucet-sepolia channel
3. Post your address: `:faucetsepolia YOUR_ADDRESS`
4. Receive test ETH in ~1 minute

## Step 2: Deploy Smart Contract to Sepolia

### Using Remix IDE (Recommended)

1. **Open Remix**
   - Go to https://remix.ethereum.org

2. **Create Contract File**
   - Click "File Explorer" → "+" button
   - Create file: `GovernanceVoting.sol`
   - Copy full contract code from `contracts/GovernanceVoting.sol`

3. **Compile Contract**
   - Click "Solidity Compiler" in left sidebar
   - Select compiler version: `0.8.19` or higher
   - Click "Compile GovernanceVoting.sol"
   - Ensure no errors appear

4. **Deploy Contract**
   - Click "Deploy & Run Transactions" in left sidebar
   - Change environment from "JavaScript VM" to "Injected Provider - MetaMask"
   - MetaMask will prompt to connect - approve the connection
   - Ensure MetaMask is set to **Sepolia network**
   - Under "CONTRACT", select "GovernanceVoting"
   - Enter constructor parameters:
     - `_governanceToken`: Enter governance token address (or 0x0000000000000000000000000000000000000000 for testing)
   - Click "Deploy" button
   - MetaMask will prompt for gas approval - click "Confirm"
   - Wait for deployment (usually 10-30 seconds)

5. **Save Contract Address**
   - Copy the deployed contract address from "Deployed Contracts" section
   - Save this address - you'll need it for environment configuration

### Example Deployment Output
```
GovernanceVoting at 0x123ABC... (get the actual address from Remix)
```

## Step 3: Configure Environment Variables

1. **Create `.env.local` file** in project root:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your values:
   ```env
   # Contract address from Remix deployment
   VITE_GOVERNANCE_CONTRACT=0xYOUR_CONTRACT_ADDRESS

   # Get API key from https://www.infura.io/
   VITE_RPC_ENDPOINT=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

   # This should always be:
   VITE_CHAIN_ID=11155111

   # Governance token address (use 0x0 if not applicable)
   VITE_GOVERNANCE_TOKEN=0x0000000000000000000000000000000000000000
   ```

3. **Get Infura API Key**
   - Go to https://www.infura.io/
   - Sign up or log in
   - Create new project
   - Select Sepolia network
   - Copy the "Sepolia" API endpoint

4. **Replace values**
   - Replace `0xYOUR_CONTRACT_ADDRESS` with address from Step 2
   - Replace `YOUR_INFURA_KEY` with key from Infura

## Step 4: Restart Development Server

```bash
npm run dev
```

The development server will reload with new environment variables.

## Step 5: Test Governance Voting

1. **Open Application**
   - Navigate to http://localhost:3000/governance

2. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select MetaMask
   - Approve connection request
   - Ensure MetaMask shows Sepolia network

3. **Create a Proposal** (if contract is empty)
   - Click "Create Proposal"
   - Fill in title, description, execution threshold (80-90)
   - Click "Create"
   - Approve transaction in MetaMask
   - Wait for confirmation

4. **Vote on Proposal**
   - Click "For" or "Against" button on a proposal
   - Confirm vote in MetaMask
   - Watch vote count update in real-time

5. **Monitor Execution**
   - As votes accumulate, watch the approval percentage
   - When it reaches 80-90%, proposal auto-executes
   - Check transaction hash on Sepolia Etherscan

## Verification

### Check Transaction on Block Explorer
1. Go to https://sepolia.etherscan.io
2. Paste your transaction hash
3. View transaction details, function calls, and events

### Verify Contract Code
1. On Etherscan, click "Contract" tab
2. Click "Verify and Publish"
3. Paste contract source code from `contracts/GovernanceVoting.sol`
4. Select compiler version and settings from Remix
5. Verify - this allows others to read contract code on Etherscan

## Troubleshooting

### "Contract not initialized" Error
- Check that `VITE_GOVERNANCE_CONTRACT` is set correctly
- Ensure contract address matches deployed address on Sepolia
- Restart dev server: `npm run dev`

### "MetaMask: Transaction failed" 
- Check that MetaMask is on Sepolia network
- Ensure account has enough Sepolia ETH for gas
- Try again after getting more test ETH from faucet

### "Provider not initialized"
- Check `VITE_RPC_ENDPOINT` is correct
- Verify Infura API key is valid
- Ensure RPC endpoint includes `/v3/YOUR_KEY`

### Transaction takes too long
- Sepolia network can be slow (5-60 seconds typical)
- Check transaction on Etherscan using hash
- Wait for enough block confirmations (usually 1-2 blocks)

### "Already voted" Error
- User has already voted on this proposal
- Function correctly prevents double voting
- User can view vote and wait for proposal completion

## Next Steps

1. **Deploy ERC20 Token** (optional)
   - Create governance token on Sepolia
   - Set address in `VITE_GOVERNANCE_TOKEN`
   - Update contract constructor to use token

2. **Create Test Proposals**
   - Create multiple proposals
   - Test full voting flow
   - Monitor threshold and auto-execution

3. **Share Contract**
   - Share contract address with team
   - All team members use same contract
   - Each user connects own wallet

4. **Mainnet Migration** (production)
   - Follow same deployment process for mainnet
   - Use mainnet Infura endpoint
   - Update chain ID to 1
   - Deploy with real governance token

## Useful Links

- **Sepolia Faucet**: https://sepoliafaucet.com
- **Remix IDE**: https://remix.ethereum.org
- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Infura Dashboard**: https://www.infura.io/dashboard
- **MetaMask**: https://metamask.io
- **OpenZeppelin Docs**: https://docs.openzeppelin.com/

## Gas Estimation

Typical gas costs on Sepolia:
- Create Proposal: ~150,000 - 200,000 gas (~0.003-0.006 ETH)
- Submit Vote: ~100,000 - 150,000 gas (~0.002-0.004 ETH)
- Execute Proposal: ~50,000 - 100,000 gas (~0.001-0.003 ETH)

Total with all operations: ~0.01 ETH (varies based on network congestion)
