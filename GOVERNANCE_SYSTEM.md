# ParaShield Governance System

## Overview

The Governance system is a decentralized voting platform where DAO members can vote on insurance parameters and protocol changes. The system uses smart contracts to automate voting, threshold monitoring, and proposal execution.

## Features

### 1. **Voting Dashboard**
- View all active and completed proposals
- Real-time voting statistics
- Progress bars showing approval percentage
- Status badges (Active, Passed, Completed, Rejected)

### 2. **Automated Threshold Execution**
- **Execution Range:** 80-90% approval
- Votes automatically execute smart contracts when threshold is reached
- No manual intervention required
- Transaction recorded on-chain

### 3. **Proposal History**
- Completed proposals remain visible
- Audit trail of all voting history
- Status clearly indicates proposal state
- Proposals never removed, only archived

### 4. **User Eligibility**
- Voting power tied to token holdings
- Depends on blockchain user count
- Dynamic threshold adjustment based on network size

## File Structure

```
src/
├── pages/
│   └── GovernancePage.tsx          # Main voting dashboard
├── services/
│   └── governanceService.ts         # Smart contract integration layer
├── types/
│   └── governanceContracts.ts       # TypeScript interfaces & types
├── components/
│   └── Header.tsx                   # Updated with Governance link
└── App.tsx                          # Updated with /governance route

docs/
├── GOVERNANCE_SMART_CONTRACTS.md    # Complete smart contract guide
└── This file (GOVERNANCE_SYSTEM.md)
```

## How It Works

### Voting Flow

```
1. User visits /governance
   ↓
2. Dashboard displays all proposals
   ↓
3. User clicks "Vote For" or "Vote Against"
   ↓
4. governanceService.submitVote() called
   ↓
5. Smart contract updates vote tally
   ↓
6. Contract checks if threshold reached
   ├─ If 80-90% approval → Auto-Execute
   │  └─ Proposal status = "Completed"
   │  └─ Transaction recorded on-chain
   └─ If < 80% approval → Continue voting
   ↓
7. Frontend updates in real-time
   ↓
8. User sees confirmation alert
```

### Auto-Execution Logic

```typescript
// When a vote is submitted:
const approvalPercentage = (votesFor * 100) / totalVoters;

// Check execution conditions:
if (approvalPercentage >= executionThreshold && 
    approvalPercentage <= 90 &&
    proposal.status === 'Active') {
  
  // Trigger smart contract execution
  smartContract.executeProposal(proposalId);
  
  // Update proposal status
  proposal.status = 'Completed';
}
```

## Proposal Structure

Each proposal contains:

```typescript
interface Proposal {
  id: number;                      // Unique identifier
  title: string;                   // Proposal title
  description: string;             // Detailed description
  votesFor: number;               // Votes in favor
  votesAgainst: number;           // Votes against
  totalVoters: number;            // Total vote count
  status: 'Active' | 'Passed' | 
          'Completed' | 'Rejected'; // Current status
  createdAt: string;              // Creation date
  executionThreshold: number;     // 80-90% threshold
}
```

### Example Proposals

#### Proposal 101: Add Flood Coverage for Rice Farmers
- **Status:** Active
- **Votes For:** 85
- **Votes Against:** 15
- **Total Voters:** 120
- **Approval:** 70.8%
- **Threshold:** 80%
- **Action:** Expand insurance to cover flood damage

#### Proposal 102: Increase Payout Cap to 2.5 ETH
- **Status:** Passed
- **Votes For:** 120
- **Votes Against:** 30
- **Total Voters:** 150
- **Approval:** 80%
- **Threshold:** 85%
- **Action:** Raise max payout limit

#### Proposal 103: Introduce Crop Rotation Incentives
- **Status:** Completed
- **Votes For:** 42
- **Votes Against:** 18
- **Total Voters:** 80
- **Approval:** 52.5%
- **Threshold:** 75%
- **Action:** Premium discounts for sustainable farming

## Blockchain User Count Integration

The voting system adapts based on total blockchain users:

```typescript
// Dynamic threshold calculation
if (blockchainUserCount < 100) {
  executionThreshold = 85%;      // Small network = higher threshold
} else if (blockchainUserCount < 1000) {
  executionThreshold = 80%;      // Medium network = standard
} else {
  executionThreshold = 75%;      // Large network = lower threshold
}

// Voting power distribution
userVotingPower = tokenBalance / totalNetworkTokens;

// Quorum requirement
minQuorumVoters = totalBlockchainUsers * 0.10; // 10%
```

## API Reference

### governanceService.submitVote()

Submit a vote on a proposal.

```typescript
const result = await governanceService.submitVote({
  proposalId: 101,
  voter: '0x1234...',
  voteType: 'for',           // 'for' or 'against'
  votingPower: 1000          // User's token balance
});

// Returns:
{
  success: true,
  transactionHash: '0xabc123...',
  blockNumber: 18234567,
  timestamp: 1707000000
}
```

### governanceService.checkVoterEligibility()

Verify if a user can vote.

```typescript
const isEligible = await governanceService.checkVoterEligibility(
  '0x1234...',               // User address
  1500                       // Total blockchain users
);

// Returns: boolean
```

### governanceService.getVoteStatus()

Get current voting status.

```typescript
const status = await governanceService.getVoteStatus(101);

// Returns:
{
  proposalId: 101,
  votesFor: 85,
  votesAgainst: 15,
  totalVoters: 120,
  approvalPercentage: 70.8,
  thresholdPercentage: 80,
  isThresholdReached: false,
  canAutoExecute: false
}
```

### governanceService.executeProposal()

Manually trigger proposal execution (typically automatic).

```typescript
const result = await governanceService.executeProposal(101);

// Returns:
{
  success: true,
  transactionHash: '0xdef456...',
  proposalStatus: 'Completed',
  timestamp: 1707000500,
  gasUsed: '150000'
}
```

### governanceService.monitorProposalThreshold()

Watch a proposal in real-time for threshold completion.

```typescript
await governanceService.monitorProposalThreshold(101, (status) => {
  // Called every 5 seconds
  console.log(`Approval: ${status.approvalPercentage}%`);
  
  if (status.canAutoExecute) {
    console.log('Threshold reached! Executing...');
  }
});
```

## UI Components

### GovernancePage

Main voting dashboard component.

**Props:** None (uses mock data and internal state)

**Features:**
- List all proposals
- Vote buttons for each proposal
- Real-time vote updates
- Status badges with color coding
- Progress bars for visual feedback

**Usage:**
```typescript
import GovernancePage from './pages/GovernancePage';

<Route path="/governance" element={<GovernancePage />} />
```

## Smart Contract Integration

The frontend integrates with smart contracts through the `governanceService`. Here's the connection architecture:

```
┌─────────────────────────────────────────┐
│      GovernancePage (UI Layer)          │
│  - Display proposals                    │
│  - Show voting interface                │
│  - Update in real-time                  │
└────────────────┬────────────────────────┘
                 │ Uses
                 ↓
┌─────────────────────────────────────────┐
│   governanceService (Integration)       │
│  - submitVote()                         │
│  - checkVoterEligibility()             │
│  - getVoteStatus()                      │
│  - executeProposal()                    │
│  - monitorProposalThreshold()           │
└────────────────┬────────────────────────┘
                 │ Calls via Web3.js/Ethers.js
                 ↓
┌─────────────────────────────────────────┐
│  Smart Contract (On-Chain)              │
│  - GovernanceVoting.sol                 │
│  - Manages voting logic                 │
│  - Auto-executes at threshold           │
│  - Records transactions                 │
└─────────────────────────────────────────┘
```

## Environment Setup

Create a `.env` file:

```env
# Smart Contract Addresses
VITE_GOVERNANCE_CONTRACT=0x1234567890123456789012345678901234567890
VITE_GOVERNANCE_TOKEN=0xABCDEF1234567890ABCDEF1234567890ABCDEF12

# Blockchain RPC
VITE_RPC_ENDPOINT=https://mainnet.infura.io/v3/YOUR_KEY
VITE_CHAIN_ID=1

# Optional: Subgraph for event indexing
VITE_SUBGRAPH_ENDPOINT=https://api.thegraph.com/subgraphs/name/...
```

## Smart Contract Deployment

For complete smart contract implementation, see [GOVERNANCE_SMART_CONTRACTS.md](./GOVERNANCE_SMART_CONTRACTS.md)

**Quick Deployment Steps:**

1. Write Solidity contract (use provided pseudocode)
2. Deploy to testnet (Sepolia, Mumbai)
3. Update contract addresses in `.env`
4. Test voting flow end-to-end
5. Deploy to mainnet

## Testing

### Manual Testing

1. Visit `/governance` route
2. View mock proposals
3. Click "Vote For" on a proposal
4. See alert: "✅ Vote submitted on-chain!"
5. Check proposal stats update
6. Reach 80% threshold and see auto-execute message

### Unit Testing Example

```typescript
describe('GovernancePage', () => {
  test('should render proposals', () => {
    render(<GovernancePage />);
    expect(screen.getByText(/Add Flood Coverage/)).toBeInTheDocument();
  });

  test('should handle vote submission', async () => {
    render(<GovernancePage />);
    const voteButton = screen.getByText(/Vote For/);
    fireEvent.click(voteButton);
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });
});
```

## Styling

Uses Tailwind CSS with custom classes:
- `glass-card`: Semi-transparent background
- `btn-primary`: Primary button style
- `gradient-text`: Gradient text color

Status badge colors:
- **Active:** Blue (`text-blue-300`, `border-blue-700`)
- **Passed:** Green (`text-green-300`, `border-green-700`)
- **Completed:** Purple (`text-purple-300`, `border-purple-700`)
- **Rejected:** Red (`text-red-300`, `border-red-700`)

## Performance Considerations

1. **Polling Interval:** 5 seconds for threshold monitoring
2. **Batch Operations:** Can batch multiple vote submissions
3. **Caching:** Cache proposal data locally
4. **Gas Optimization:** Contract uses efficient storage patterns

## Security Notes

⚠️ **Important:** Before production deployment:

1. **Smart Contract Audit:** Get contract audited by security firm
2. **Access Control:** Implement proper role-based access
3. **Vote Verification:** Ensure no double voting
4. **Front-running Protection:** Use block delays or commit-reveal
5. **Emergency Pause:** Add circuit breaker for critical issues

## Troubleshooting

### Issue: Votes not submitting
**Solution:** Check wallet is connected and has sufficient balance

### Issue: Proposal not auto-executing
**Solution:** Verify threshold percentage and vote counts

### Issue: Status not updating
**Solution:** Ensure smart contract events are being monitored

## Next Steps

1. **Deploy Smart Contract:** Use Solidity code from GOVERNANCE_SMART_CONTRACTS.md
2. **Connect Web3:** Link Web3Context to contract
3. **Add Gas Management:** Show estimated gas fees
4. **Event Indexing:** Use The Graph to index voting events
5. **Analytics:** Add voting history and statistics dashboard

## Documentation

- [Smart Contracts Implementation Guide](./GOVERNANCE_SMART_CONTRACTS.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./API.md)

## Support

For issues or questions:
1. Check [GOVERNANCE_SMART_CONTRACTS.md](./GOVERNANCE_SMART_CONTRACTS.md) for smart contract details
2. Review smart contract pseudocode for logic
3. Check environment variables are set correctly
4. Verify blockchain connection through Web3Context

---

**Last Updated:** February 4, 2026
**Status:** Ready for smart contract integration
