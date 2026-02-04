# Governance System - Developer Quick Reference

## 🚀 Quick Start

### 1. Access the Governance Page
- Navigate to `/governance` route
- View all proposals and voting status
- Vote on active proposals

### 2. Vote on a Proposal
```typescript
// User clicks "Vote For" button
handleVote(proposalId, 'for') 
  → governanceService.submitVote(params)
  → Smart contract updates vote count
  → Check if threshold reached
  → If 80-90% → Auto-execute
  → Alert user with result
```

### 3. Proposal Lifecycle
```
Active (voting open)
    ↓ [Vote cast]
    ↓ [Reach 80%+ threshold]
Completed (executed)
```

## 📁 File Locations

| File | Purpose |
|------|---------|
| `src/pages/GovernancePage.tsx` | Main voting dashboard |
| `src/services/governanceService.ts` | Smart contract integration |
| `src/types/governanceContracts.ts` | TypeScript types & interfaces |
| `GOVERNANCE_SMART_CONTRACTS.md` | Smart contract implementation |
| `GOVERNANCE_SYSTEM.md` | System documentation |

## 🎯 Key Features

### Mock Proposals (3 Examples)
1. **ID 101:** Add Flood Coverage (Active)
2. **ID 102:** Increase Payout Cap (Passed)
3. **ID 103:** Crop Rotation Incentives (Completed)

### Voting Features
- ✅ Vote For / Vote Against buttons
- 📊 Real-time vote progress bar
- 🎯 80-90% auto-execution threshold
- 📌 Persistent proposal history
- 🔔 Status badges (Active/Completed/Passed/Rejected)

### Smart Contract Integration
- Submits votes to blockchain
- Monitors vote threshold in real-time
- Auto-executes when threshold reached
- Records all transactions on-chain

## 💻 Code Examples

### Submit a Vote
```typescript
import { governanceService } from './services/governanceService';

const handleVote = async (proposalId: number, voteType: 'for' | 'against') => {
  try {
    const result = await governanceService.submitVote({
      proposalId,
      voter: userAddress,
      voteType,
      votingPower: userTokenBalance
    });
    
    alert(`✅ Vote submitted! Hash: ${result.transactionHash}`);
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
};
```

### Check Vote Status
```typescript
const status = await governanceService.getVoteStatus(proposalId);

console.log(`Approval: ${status.approvalPercentage}%`);
console.log(`Threshold: ${status.thresholdPercentage}%`);
console.log(`Can auto-execute: ${status.canAutoExecute}`);
```

### Monitor for Threshold
```typescript
await governanceService.monitorProposalThreshold(
  proposalId,
  (status) => {
    if (status.canAutoExecute) {
      console.log('Executing proposal...');
    }
  }
);
```

## 🏗️ Architecture

```
Frontend (React)
    ↓
GovernancePage Component
    ↓
governanceService
    ↓
Web3.js/Ethers.js
    ↓
Smart Contract (Solidity)
    ↓
Blockchain
```

## 🔧 Configuration

### Environment Variables (.env)
```env
VITE_GOVERNANCE_CONTRACT=0x...
VITE_RPC_ENDPOINT=https://...
VITE_CHAIN_ID=1
```

### Status Badge Colors
- 🔵 **Active:** Blue
- 🟢 **Passed:** Green
- 🟣 **Completed:** Purple
- 🔴 **Rejected:** Red

## 📊 Data Structures

### Proposal Object
```typescript
{
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  status: 'Active' | 'Passed' | 'Completed' | 'Rejected';
  executionThreshold: number; // 80-90%
  createdAt: string;
}
```

### Vote Result
```typescript
{
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}
```

## ✅ Approval Thresholds

| Network Size | Threshold |
|---|---|
| < 100 users | 85% |
| 100-1000 users | 80% |
| > 1000 users | 75% |

## 🔌 Smart Contract Methods

| Method | Purpose | Params |
|--------|---------|--------|
| `submitVote()` | Submit a vote | proposalId, support, votingPower |
| `checkAndExecute()` | Check threshold & execute | proposalId |
| `executeProposal()` | Execute proposal logic | proposalId |
| `getVoteStatus()` | Get current votes | proposalId |
| `checkVoterEligibility()` | Verify voter | voter address |

## 🚨 Common Issues & Fixes

### Issue: Votes Not Submitting
```typescript
// Check 1: Wallet connected
if (!account) {
  alert('Please connect wallet first');
  return;
}

// Check 2: Sufficient balance
if (votingPower <= 0) {
  alert('Insufficient balance for voting');
  return;
}

// Check 3: Proposal still active
if (proposal.status !== 'Active') {
  alert('Voting closed for this proposal');
  return;
}
```

### Issue: Auto-Execute Not Triggering
```typescript
// Verify threshold calculation
const approvalPercentage = (votesFor * 100) / totalVoters;
const shouldExecute = approvalPercentage >= 80 && 
                      approvalPercentage <= 90;

console.log(`Approval: ${approvalPercentage}%`);
console.log(`Should execute: ${shouldExecute}`);
```

## 📈 Voting Example

**Proposal: Add Flood Coverage (ID: 101)**

| Time | Event | Votes For | Votes Against | Total | Approval % | Status |
|------|-------|-----------|---------------|-------|-----------|--------|
| T0 | Created | 0 | 0 | 0 | 0% | Active |
| T1 | 50 votes | 42 | 8 | 50 | 84% | 🎯 **THRESHOLD MET** |
| T2 | Executed | 42 | 8 | 50 | 84% | ✅ **Completed** |

## 🔐 Security Checklist

Before production:
- [ ] Smart contract audited
- [ ] No double voting possible
- [ ] Access control implemented
- [ ] Front-running protected
- [ ] Emergency pause mechanism
- [ ] Event logging enabled
- [ ] Gas optimization done

## 📚 Related Documentation

- **Smart Contracts:** [GOVERNANCE_SMART_CONTRACTS.md](./GOVERNANCE_SMART_CONTRACTS.md)
- **Full System:** [GOVERNANCE_SYSTEM.md](./GOVERNANCE_SYSTEM.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **API Docs:** [API.md](./API.md)

## 🎨 UI Components

### GovernancePage
- Displays all proposals
- Vote buttons per proposal
- Progress bars
- Status badges
- Vote counts
- Creation dates

### Header Integration
- Navigation link to `/governance`
- Active state highlighting
- Mobile responsive menu

## 🧪 Testing Checklist

- [ ] Vote submission works
- [ ] Vote counts update
- [ ] Threshold calculation correct
- [ ] Auto-execution triggers at 80%+
- [ ] Status changes to "Completed"
- [ ] Alerts display correctly
- [ ] Mobile responsive works
- [ ] Wallet connection required

## 💡 Tips & Best Practices

1. **Always check voter eligibility** before voting
2. **Monitor threshold in real-time** for user feedback
3. **Persist proposal history** for audit trail
4. **Use batch operations** for multiple votes
5. **Cache data locally** to reduce blockchain calls
6. **Implement error boundaries** for contract failures
7. **Log all transactions** for debugging
8. **Use event listeners** for real-time updates

## 🔗 Integration Points

- **Web3Context:** Connect wallet & get user account
- **Smart Contract:** Execute votes & proposals
- **The Graph:** Index voting events
- **IPFS:** Store proposal details
- **Notifications:** Alert users of status changes

## 📞 Support Resources

1. Review smart contract pseudocode
2. Check governanceService implementation
3. Verify environment variables
4. Test on testnet first
5. Use browser console for debugging

---

**Version:** 1.0  
**Last Updated:** February 4, 2026  
**Status:** Ready for development
