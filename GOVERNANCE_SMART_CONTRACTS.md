# Governance Smart Contracts - Implementation Guide

## Overview

The Governance voting system uses smart contracts to automate voting, calculate thresholds, and execute proposals. This document outlines the contract architecture, integration points, and implementation requirements.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GovernancePage.tsx                       │
│              (Voting Dashboard - Frontend)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Calls via governanceService
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  governanceService.ts                       │
│         (Smart Contract Integration Layer)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    Web3.js / Ethers.js   Smart Contract (On-Chain)
                          ├─ GovernanceVoting.sol
                          ├─ Voting Logic
                          ├─ Threshold Monitoring
                          └─ Auto-Execution
```

## Smart Contract Functions

### 1. `submitVote(uint256 proposalId, bool support)`

**Purpose:** Allow DAO members to vote on a proposal

**Parameters:**
- `proposalId`: ID of the proposal to vote on
- `support`: True for "Vote For", False for "Vote Against"

**Logic:**
```
1. Verify caller is eligible (has voting power)
2. Check proposal status is "Active"
3. Check caller hasn't already voted
4. Add vote to proposal tallies
5. Increment total voters
6. Check and auto-execute if threshold reached
7. Emit VoteSubmitted event
```

**Gas Estimate:** ~80,000 - 150,000 gas

### 2. `checkAndExecute(uint256 proposalId)`

**Purpose:** Automatically execute proposal when voting reaches threshold

**Execution Threshold:**
- Minimum: 80%
- Maximum: 90%

**Logic:**
```
1. Calculate approval percentage: (votesFor * 100) / totalVoters
2. Check if approval >= executionThreshold
3. Check if approval <= 90% (max threshold)
4. If both conditions met, call executeProposal()
5. Update proposal status to "Completed"
6. Emit ProposalExecuted event
```

**Example Scenario:**
- Proposal A has executionThreshold = 80%
- After 100 votes: 82 for, 18 against
- Approval = 82%
- 82% >= 80% ✓
- 82% <= 90% ✓
- AUTO-EXECUTE TRIGGERED

### 3. `executeProposal(uint256 proposalId)`

**Purpose:** Execute the proposal changes on-chain

**Actions Based on Proposal Type:**
- **Add Coverage Type:** Update coverageTypes mapping
- **Increase Payout Cap:** Modify payoutCap variable
- **Update Parameters:** Change protocol settings

**Logic:**
```
1. Mark proposal status as "Completed"
2. Store execution timestamp
3. Execute proposal-specific logic
4. Log transaction hash
5. Emit ProposalExecuted event
6. Return execution results
```

### 4. `checkVoterEligibility(address voter)`

**Purpose:** Verify voter can participate in governance

**Criteria:**
- Holds minimum DAO tokens (e.g., 1 token)
- Account has been on-chain for minimum period
- Not in blacklist/penalties

**Return:** Boolean (eligible/not eligible)

### 5. `getVoteStatus(uint256 proposalId)`

**Purpose:** Get current voting stats and threshold status

**Returns:**
```solidity
{
  uint256 votesFor,
  uint256 votesAgainst,
  uint256 totalVoters,
  uint256 approvalPercentage,
  uint256 executionThreshold,
  bool isThresholdReached,
  bool canAutoExecute
}
```

## State Variables

```solidity
// Core Data Structures
mapping(uint256 => Proposal) public proposals;
mapping(uint256 => mapping(address => bool)) public hasVoted;
mapping(address => uint256) public userTokenBalance;
mapping(address => bool) public blacklistedVoters;

// Contract Settings
uint256 public constant EXECUTION_THRESHOLD_MIN = 80;
uint256 public constant EXECUTION_THRESHOLD_MAX = 90;
uint256 public constant MIN_VOTING_PERIOD = 3 days;
uint256 public constant VOTING_DELAY = 1 block;

// Governance Token
IERC20 public governanceToken;
uint256 public constant MIN_TOKEN_BALANCE = 1e18; // 1 token (18 decimals)

// Event Tracking
uint256 public totalProposals;
uint256 public totalVotes;
```

## Data Structures

```solidity
struct Proposal {
  uint256 id;
  string title;
  string description;
  uint256 votesFor;
  uint256 votesAgainst;
  uint256 totalVoters;
  string status; // "Active", "Completed", "Rejected", "Pending"
  uint256 executionThreshold; // 80-90%
  uint256 createdAt;
  uint256 executedAt;
  address creator;
  string proposalType; // "coverage", "payout", "parameter"
}

struct VoteRecord {
  address voter;
  uint256 votingPower;
  bool support;
  uint256 timestamp;
  uint256 blockNumber;
}
```

## Events

```solidity
event ProposalCreated(
  indexed uint256 proposalId,
  string title,
  address indexed creator,
  uint256 timestamp
);

event VoteSubmitted(
  indexed uint256 proposalId,
  indexed address voter,
  bool support,
  uint256 votingPower,
  uint256 timestamp
);

event ThresholdReached(
  indexed uint256 proposalId,
  uint256 approvalPercentage,
  uint256 timestamp
);

event ProposalExecuted(
  indexed uint256 proposalId,
  string status,
  bytes32 executionHash,
  uint256 timestamp
);

event VoterEligibilityChanged(
  indexed address voter,
  bool isEligible,
  string reason
);
```

## Integration Points with Frontend

### 1. Vote Submission Flow

```typescript
// Frontend (GovernancePage.tsx)
const handleVote = async (proposalId, voteType) => {
  // 1. Call governanceService.submitVote()
  const result = await governanceService.submitVote({
    proposalId,
    voter: userAddress,
    voteType,
    votingPower: userTokenBalance
  });

  // 2. Service calls smart contract
  // 3. Contract updates votes and checks threshold
  // 4. If threshold reached, auto-executes
  // 5. Frontend updates proposal status to "Completed"
};
```

### 2. Real-time Status Monitoring

```typescript
// Monitor proposal for threshold completion
const monitorProposal = async (proposalId) => {
  await governanceService.monitorProposalThreshold(
    proposalId,
    (status) => {
      // Update UI with latest voting stats
      setProposal({
        ...proposal,
        votesFor: status.votesFor,
        votesAgainst: status.votesAgainst,
        status: status.canAutoExecute ? 'Completed' : 'Active'
      });
    }
  );
};
```

## Blockchain User Count Integration

The voting system depends on the number of blockchain users to:

1. **Calculate Voting Power Distribution:**
   - Each user's voting weight = tokenBalance / totalUserTokens
   - More users = more distributed voting power

2. **Determine Quorum Requirements:**
   - Quorum = 10% of active users
   - Proposal needs minimum participation

3. **Adjust Thresholds Dynamically:**
   ```
   if (blockchainUserCount < 100) {
     executionThreshold = 85%; // Higher threshold for small networks
   } else if (blockchainUserCount < 1000) {
     executionThreshold = 80%; // Standard threshold
   } else {
     executionThreshold = 75%; // Lower threshold for large networks
   }
   ```

## Proposal Status Flow

```
┌─────────────┐
│   Pending   │  (Under review by admins)
└──────┬──────┘
       │ Approved
       ▼
┌─────────────┐
│   Active    │  (Voting is live)
└──────┬──────┘
       │ 80-90% approval reached
       ▼
┌─────────────┐
│  Completed  │  (Executed on-chain, not removed)
└─────────────┘

OR

       │ < 80% approval + timeout
       ▼
┌─────────────┐
│  Rejected   │  (Failed to reach threshold)
└─────────────┘
```

## Key Features

### 1. Auto-Execution
- When approval percentage reaches 80-90%, contract automatically executes
- No need for manual intervention
- Transaction recorded on-chain

### 2. Persistent History
- Completed proposals are NOT deleted
- Status clearly shows "Completed"
- Available for audit trail and historical review

### 3. Gas Optimization
```solidity
// Batch operations for multiple proposals
function batchExecuteProposals(uint256[] calldata proposalIds) external {
  for (uint i = 0; i < proposalIds.length; i++) {
    if (shouldExecute(proposalIds[i])) {
      executeProposal(proposalIds[i]);
    }
  }
}
```

## Environment Variables

Create a `.env` file with:
```
VITE_GOVERNANCE_CONTRACT=0x1234567890123456789012345678901234567890
VITE_RPC_ENDPOINT=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
VITE_CHAIN_ID=1
VITE_GOVERNANCE_TOKEN=0xABCDEF1234567890ABCDEF1234567890ABCDEF12
```

## Testing

### Unit Tests
```typescript
describe('GovernanceVoting', () => {
  test('submitVote should update vote counts', () => {});
  test('should execute when threshold reached', () => {});
  test('should prevent double voting', () => {});
  test('should check voter eligibility', () => {});
});
```

### Integration Tests
```typescript
describe('Frontend-Contract Integration', () => {
  test('handleVote should call submitVote', () => {});
  test('should update proposal status to Completed', () => {});
  test('should alert user on successful submission', () => {});
});
```

## Security Considerations

1. **Reentrancy Protection:** Use checks-effects-interactions pattern
2. **Vote Manipulation:** Prevent double voting via hasVoted mapping
3. **Voter Eligibility:** Verify token balance and account status
4. **Front-running:** Use random block delays for execution
5. **Blacklist:** Maintain blacklist of malicious voters

## Deployment Checklist

- [ ] Deploy GovernanceVoting.sol to blockchain
- [ ] Deploy GovernanceToken.sol (if new)
- [ ] Set GOVERNANCE_TOKEN address in contract
- [ ] Configure MIN_TOKEN_BALANCE
- [ ] Set EXECUTION_THRESHOLD values
- [ ] Update .env with contract addresses
- [ ] Deploy frontend with integrated governanceService
- [ ] Test voting flow end-to-end
- [ ] Verify auto-execution mechanism
- [ ] Setup event monitoring/indexing

## Next Steps

1. **Write Solidity Contract:** Implement using OpenZeppelin libraries
2. **Deploy to Testnet:** Test on Ethereum Sepolia or Polygon Mumbai
3. **Connect Frontend:** Link governanceService to contract
4. **Add Gas Management:** Implement fee estimation UI
5. **Monitor Events:** Index events with The Graph

---

For more information, see:
- [Smart Contracts Documentation](./SMART_CONTRACTS.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./API.md)
