# Governance Frontend Integration Guide

## Overview
The frontend is now configured to work with real Sepolia testnet smart contracts using Ethers.js. This guide explains how the voting system integrates with blockchain.

## Architecture

```
┌─────────────────────────────────────────┐
│     GovernancePage.tsx (UI)             │
│  - Voting buttons                       │
│  - Real-time vote counting              │
│  - Wallet validation                    │
└────────────┬────────────────────────────┘
             │
┌────────────v────────────────────────────┐
│  Web3Context (Wallet Connection)        │
│  - MetaMask integration                 │
│  - Account & chain ID checking          │
│  - Provider & signer management         │
└────────────┬────────────────────────────┘
             │
┌────────────v────────────────────────────┐
│  governanceService.ts (Blockchain Logic)│
│  - Real contract calls (Ethers.js)      │
│  - Vote submission                      │
│  - Status monitoring                    │
│  - Auto-execution                       │
└────────────┬────────────────────────────┘
             │
┌────────────v────────────────────────────┐
│  GovernanceVoting.sol (Smart Contract)  │
│  - Sepolia testnet deployment           │
│  - Vote tracking                        │
│  - Threshold checking                   │
│  - Auto-execution logic                 │
└─────────────────────────────────────────┘
```

## Key Components

### 1. **GovernancePage.tsx** (React Component)
- **File**: `src/pages/GovernancePage.tsx`
- **Purpose**: User interface for voting
- **Key Functions**:
  - `handleVote(proposalId, voteType)` - Submit vote
  - `isWalletConnected()` - Check if MetaMask connected
  - `hasUserVoted(proposalId)` - Prevent double voting

### 2. **governanceService.ts** (Service Layer)
- **File**: `src/services/governanceService.ts`
- **Purpose**: Blockchain integration layer
- **Key Methods**:
  - `submitVote()` - Send transaction to blockchain
  - `getVoteStatus()` - Fetch real vote counts
  - `executeProposal()` - Trigger proposal execution
  - `setSigner()` - Connect wallet after MetaMask approval

### 3. **GovernanceVoting.sol** (Smart Contract)
- **File**: `contracts/GovernanceVoting.sol`
- **Purpose**: On-chain voting logic
- **Key Functions**:
  - `submitVote(proposalId, support)` - Record vote
  - `getVoteStatus(proposalId)` - Return vote stats
  - `checkAndExecute(proposalId)` - Auto-execute at 80-90%

### 4. **Web3Context.tsx** (Provider)
- **File**: `src/context/Web3Context.tsx`
- **Purpose**: Manage wallet connection state
- **Provides**: `useWeb3()` hook with account, chainId, provider, signer

## Voting Flow

### User Flow (Frontend)
```
1. User visits /governance page
   ↓
2. Clicks "Connect Wallet"
   ↓
3. MetaMask prompts approval
   ↓
4. Web3Context updates with account/signer
   ↓
5. User clicks "Vote For" or "Vote Against"
   ↓
6. handleVote() validates:
   - Wallet connected ✓
   - Proposal is Active ✓
   - User hasn't voted ✓
   ↓
7. governanceService.submitVote() called
   ↓
8. MetaMask prompts gas approval
   ↓
9. Transaction sent to Sepolia
   ↓
10. Vote count updates in real-time
```

### Blockchain Flow (Smart Contract)
```
1. submitVote() called with proposalId, support flag
   ↓
2. Check: User hasn't voted before
   ↓
3. Check: Proposal is Active
   ↓
4. Record vote (votesFor++ or votesAgainst++)
   ↓
5. Mark user as voted
   ↓
6. Call checkAndExecute()
   ↓
7. If 80% <= approval <= 90%:
   - Set status to "Completed"
   - Emit ProposalExecuted event
   ↓
8. Emit VoteSubmitted event
   ↓
9. Return success to frontend
```

## Environment Configuration

### Required Environment Variables
```env
# Contract deployed on Sepolia (from Remix)
VITE_GOVERNANCE_CONTRACT=0x1234...

# Sepolia RPC endpoint (from Infura)
VITE_RPC_ENDPOINT=https://sepolia.infura.io/v3/YOUR_KEY

# Sepolia chain ID
VITE_CHAIN_ID=11155111

# Governance token (optional)
VITE_GOVERNANCE_TOKEN=0x5678...
```

### Setup Steps
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:
   - Get contract address from Remix deployment
   - Get Infura key from https://www.infura.io/
   - Keep chain ID as 11155111 (Sepolia)

3. Restart dev server:
   ```bash
   npm run dev
   ```

## Real Voting Features

### 1. **Real Vote Counting**
- Initial state: `votesFor: 0, votesAgainst: 0`
- Each vote is recorded on blockchain
- Vote count updates immediately after transaction
- No hardcoded or mock data

### 2. **Wallet-Based Voting**
- Users must connect MetaMask
- Only connected account can vote
- Voting power tied to blockchain account
- Error messages if wallet not connected

### 3. **Double-Vote Prevention**
- Smart contract tracks `hasVoted` mapping
- User can't vote twice on same proposal
- Button disabled after voting
- Error message: "Already voted"

### 4. **Threshold Monitoring**
- Approval percentage calculated: `(votesFor / totalVotes) * 100`
- Threshold range: 80-90%
- Auto-executes when threshold met
- Real-time monitoring every 5 seconds

### 5. **Auto-Execution**
- When approval reaches 80-90%:
  - Smart contract auto-executes
  - Proposal status changes to "Completed"
  - Event emitted on blockchain
  - Frontend shows confirmation

## Testing Real Voting

### Prerequisites
1. MetaMask installed and configured
2. Sepolia testnet added to MetaMask
3. Sepolia ETH in account (from faucet)
4. Smart contract deployed to Sepolia
5. Environment variables set

### Testing Steps

1. **Test 1: Create Proposal**
   - Visit http://localhost:3000/governance
   - Click "Connect Wallet"
   - Create new proposal with title, description, threshold 85
   - Approve MetaMask transaction
   - Verify proposal appears in list

2. **Test 2: Cast Vote**
   - Click "For" or "Against" button
   - Approve MetaMask transaction
   - Watch vote count increase in real-time
   - Verify button becomes disabled

3. **Test 3: Multiple Votes**
   - Open application in second wallet/account
   - Vote on same proposal
   - Watch approval percentage update
   - Test threshold check at 80% and 90%

4. **Test 4: Auto-Execution**
   - Get multiple accounts voting
   - Monitor approval percentage
   - When 80-90%: verify auto-execution
   - Check "Completed" status on blockchain
   - View transaction on Sepolia Etherscan

### Debugging Real Voting

**Issue**: "Contract not initialized"
- **Cause**: `VITE_GOVERNANCE_CONTRACT` not set or invalid
- **Fix**: Check `.env.local`, restart `npm run dev`

**Issue**: "Provider not initialized"
- **Cause**: `VITE_RPC_ENDPOINT` invalid or missing API key
- **Fix**: Verify Infura endpoint format and API key

**Issue**: "Already voted" error
- **Cause**: User voted on this proposal before
- **Fix**: This is correct behavior - double-vote prevention works

**Issue**: Vote doesn't appear in real-time
- **Cause**: Transaction still pending
- **Fix**: Wait for MetaMask confirmation, check Sepolia Etherscan

**Issue**: Auto-execution didn't trigger
- **Cause**: Approval not in 80-90% range
- **Fix**: Adjust vote percentage to reach threshold

## Code Integration Points

### 1. **In GovernancePage.tsx**
```typescript
// Using governanceService
const handleVote = async (proposalId: number, voteType: 'for' | 'against') => {
  try {
    const result = await governanceService.submitVote({
      proposalId,
      voter: account!,
      voteType,
      votingPower: 1
    });
    // Vote submitted successfully
  } catch (error) {
    // Handle error
  }
};
```

### 2. **In Web3Context.tsx**
```typescript
// Setting signer for governanceService
const signer = provider?.getSigner();
governanceService.setSigner(signer);
```

### 3. **In Environment Setup**
```typescript
// Service automatically reads from .env.local
const service = new GovernanceService(
  process.env.VITE_GOVERNANCE_CONTRACT,
  process.env.VITE_RPC_ENDPOINT
);
```

## Next Steps

1. **Deploy Smart Contract**
   - See `SEPOLIA_DEPLOYMENT_GUIDE.md`

2. **Configure Environment**
   - Set contract address and RPC endpoint

3. **Test Full Flow**
   - Create proposals
   - Cast votes
   - Monitor execution

4. **Monitor on Blockchain**
   - View transactions on Sepolia Etherscan
   - Verify vote events
   - Check proposal status

5. **Production Readiness**
   - Test with multiple users
   - Verify auto-execution behavior
   - Monitor gas costs

## Resources

- **Ethers.js Docs**: https://docs.ethers.org/v6/
- **Sepolia Faucet**: https://sepoliafaucet.com
- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Remix IDE**: https://remix.ethereum.org
- **MetaMask**: https://metamask.io
