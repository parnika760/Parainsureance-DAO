// SPDX-License-Identifier: MIT
// Smart Contract Interface for Governance Voting System
// This file outlines the smart contract structure for automated voting and execution

/**
 * @dev Smart Contract for DAO Governance Voting System
 * 
 * FEATURES:
 * 1. Proposal Management: Create and track proposals
 * 2. Voting System: Members vote on proposals
 * 3. Auto-Execution: When voting reaches 80-90% threshold, transactions execute automatically
 * 4. User Eligibility: Voting power based on blockchain user count and token holdings
 * 5. Status Tracking: Proposals show status (Active, Passed, Completed, Rejected)
 * 
 * FLOW:
 * Proposal Created (Active) → Members Vote → Votes Reach Threshold → Auto-Execute → Completed
 */

export interface SmartContractInteraction {
  /**
   * Submit a vote on a proposal
   * @param proposalId - ID of the proposal to vote on
   * @param voter - Address of the voter
   * @param voteType - 'for' or 'against'
   * @param votingPower - User's voting power based on token holdings
   * @returns Promise<TransactionResult>
   */
  submitVote(
    proposalId: number,
    voter: string,
    voteType: 'for' | 'against',
    votingPower: number
  ): Promise<TransactionResult>;

  /**
   * Check if a voter is eligible to vote
   * @param voter - Address to check eligibility for
   * @param blockchainUserCount - Total number of active blockchain users
   * @returns Promise<boolean>
   */
  checkVoterEligibility(voter: string, blockchainUserCount: number): Promise<boolean>;

  /**
   * Get current vote status and check if threshold is reached
   * @param proposalId - ID of the proposal
   * @returns Promise<VoteStatus>
   */
  getVoteStatus(proposalId: number): Promise<VoteStatus>;

  /**
   * Auto-execute proposal when threshold is reached
   * @param proposalId - ID of the proposal to execute
   * @returns Promise<ExecutionResult>
   */
  executeProposal(proposalId: number): Promise<ExecutionResult>;

  /**
   * Get all proposals and their statuses
   * @returns Promise<Proposal[]>
   */
  getAllProposals(): Promise<SmartContractProposal[]>;
}

export interface VoteStatus {
  proposalId: number;
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  approvalPercentage: number;
  thresholdPercentage: number;
  isThresholdReached: boolean;
  canAutoExecute: boolean;
}

export interface ExecutionResult {
  success: boolean;
  transactionHash: string;
  proposalStatus: 'Completed' | 'Rejected' | 'Failed';
  timestamp: number;
  gasUsed: string;
}

export interface TransactionResult {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface SmartContractProposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  status: 'Active' | 'Passed' | 'Completed' | 'Rejected';
  executionThreshold: number;
  createdAt: number;
  executedAt?: number;
  transactionHash?: string;
}

/**
 * SMART CONTRACT PSEUDOCODE (Solidity Reference)
 * 
 * contract GovernanceVoting {
 *   uint256 public constant EXECUTION_THRESHOLD_MIN = 80; // 80%
 *   uint256 public constant EXECUTION_THRESHOLD_MAX = 90; // 90%
 *   
 *   mapping(uint256 => Proposal) public proposals;
 *   mapping(uint256 => mapping(address => bool)) public hasVoted;
 *   mapping(address => uint256) public userTokenBalance;
 *   
 *   struct Proposal {
 *     uint256 id;
 *     string title;
 *     uint256 votesFor;
 *     uint256 votesAgainst;
 *     uint256 totalVoters;
 *     string status; // Active, Completed, Rejected
 *     uint256 executionThreshold;
 *     uint256 createdAt;
 *   }
 *   
 *   event VoteSubmitted(uint256 indexed proposalId, address indexed voter, bool support);
 *   event ProposalExecuted(uint256 indexed proposalId, string status);
 *   
 *   function submitVote(uint256 proposalId, bool support) external {
 *     require(!hasVoted[proposalId][msg.sender], "Already voted");
 *     require(proposals[proposalId].status == "Active", "Voting closed");
 *     
 *     uint256 votingPower = userTokenBalance[msg.sender];
 *     require(votingPower > 0, "No voting power");
 *     
 *     if (support) {
 *       proposals[proposalId].votesFor += votingPower;
 *     } else {
 *       proposals[proposalId].votesAgainst += votingPower;
 *     }
 *     proposals[proposalId].totalVoters += 1;
 *     hasVoted[proposalId][msg.sender] = true;
 *     
 *     checkAndExecute(proposalId);
 *     emit VoteSubmitted(proposalId, msg.sender, support);
 *   }
 *   
 *   function checkAndExecute(uint256 proposalId) internal {
 *     Proposal storage proposal = proposals[proposalId];
 *     uint256 approvalPercentage = (proposal.votesFor * 100) / proposal.totalVoters;
 *     
 *     if (approvalPercentage >= proposal.executionThreshold && 
 *         approvalPercentage <= EXECUTION_THRESHOLD_MAX) {
 *       executeProposal(proposalId);
 *     }
 *   }
 *   
 *   function executeProposal(uint256 proposalId) internal {
 *     proposals[proposalId].status = "Completed";
 *     // Execute protocol changes based on proposal type
 *     emit ProposalExecuted(proposalId, "Completed");
 *   }
 * }
 */

export default SmartContractInteraction;
