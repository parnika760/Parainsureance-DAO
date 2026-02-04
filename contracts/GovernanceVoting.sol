// Solidity Smart Contract for Governance Voting
// Deploy to Sepolia Testnet
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
  function balanceOf(address account) external view returns (uint256);
}

contract GovernanceVoting {
  // Constants
  uint256 public constant EXECUTION_THRESHOLD_MIN = 80;
  uint256 public constant EXECUTION_THRESHOLD_MAX = 90;
  
  // State Variables
  IERC20 public governanceToken;
  uint256 public totalProposals;
  
  // Proposal structure
  struct Proposal {
    uint256 id;
    string title;
    string description;
    uint256 votesFor;
    uint256 votesAgainst;
    uint256 totalVoters;
    string status; // "Active", "Completed", "Rejected"
    uint256 executionThreshold;
    uint256 createdAt;
    uint256 executedAt;
    address creator;
  }
  
  // Mappings
  mapping(uint256 => Proposal) public proposals;
  mapping(uint256 => mapping(address => bool)) public hasVoted;
  mapping(address => uint256) public userTokenBalance;
  
  // Events
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
    uint256 timestamp
  );
  
  // Constructor
  constructor(address _governanceToken) {
    governanceToken = IERC20(_governanceToken);
    totalProposals = 0;
  }
  
  // Create Proposal
  function createProposal(
    string memory _title,
    string memory _description,
    uint256 _executionThreshold
  ) external returns (uint256) {
    require(_executionThreshold >= EXECUTION_THRESHOLD_MIN, "Threshold too low");
    require(_executionThreshold <= EXECUTION_THRESHOLD_MAX, "Threshold too high");
    
    totalProposals++;
    uint256 proposalId = totalProposals;
    
    proposals[proposalId] = Proposal({
      id: proposalId,
      title: _title,
      description: _description,
      votesFor: 0,
      votesAgainst: 0,
      totalVoters: 0,
      status: "Active",
      executionThreshold: _executionThreshold,
      createdAt: block.timestamp,
      executedAt: 0,
      creator: msg.sender
    });
    
    emit ProposalCreated(proposalId, _title, msg.sender, block.timestamp);
    return proposalId;
  }
  
  // Submit Vote
  function submitVote(uint256 _proposalId, bool _support) external {
    require(_proposalId > 0 && _proposalId <= totalProposals, "Invalid proposal");
    require(!hasVoted[_proposalId][msg.sender], "Already voted");
    require(
      keccak256(abi.encodePacked(proposals[_proposalId].status)) == 
      keccak256(abi.encodePacked("Active")),
      "Voting closed"
    );
    
    Proposal storage proposal = proposals[_proposalId];
    
    if (_support) {
      proposal.votesFor++;
    } else {
      proposal.votesAgainst++;
    }
    proposal.totalVoters++;
    hasVoted[_proposalId][msg.sender] = true;
    
    emit VoteSubmitted(_proposalId, msg.sender, _support, block.timestamp);
    
    // Check and execute
    checkAndExecute(_proposalId);
  }
  
  // Check and Execute
  function checkAndExecute(uint256 _proposalId) internal {
    Proposal storage proposal = proposals[_proposalId];
    
    if (proposal.totalVoters == 0) return;
    
    uint256 approvalPercentage = (proposal.votesFor * 100) / proposal.totalVoters;
    
    if (
      approvalPercentage >= proposal.executionThreshold &&
      approvalPercentage <= EXECUTION_THRESHOLD_MAX &&
      keccak256(abi.encodePacked(proposal.status)) == 
      keccak256(abi.encodePacked("Active"))
    ) {
      proposal.status = "Completed";
      proposal.executedAt = block.timestamp;
      
      emit ThresholdReached(_proposalId, approvalPercentage, block.timestamp);
      emit ProposalExecuted(_proposalId, "Completed", block.timestamp);
    }
  }
  
  // Get Proposal
  function getProposal(uint256 _proposalId) 
    external 
    view 
    returns (Proposal memory) 
  {
    return proposals[_proposalId];
  }
  
  // Get Vote Status
  function getVoteStatus(uint256 _proposalId) 
    external 
    view 
    returns (
      uint256 votesFor,
      uint256 votesAgainst,
      uint256 totalVoters,
      uint256 approvalPercentage,
      bool canExecute
    ) 
  {
    Proposal storage proposal = proposals[_proposalId];
    votesFor = proposal.votesFor;
    votesAgainst = proposal.votesAgainst;
    totalVoters = proposal.totalVoters;
    
    if (totalVoters > 0) {
      approvalPercentage = (votesFor * 100) / totalVoters;
    } else {
      approvalPercentage = 0;
    }
    
    canExecute = 
      approvalPercentage >= proposal.executionThreshold &&
      approvalPercentage <= EXECUTION_THRESHOLD_MAX &&
      keccak256(abi.encodePacked(proposal.status)) == 
      keccak256(abi.encodePacked("Active"));
  }
  
  // Check if user voted
  function userHasVoted(uint256 _proposalId, address _voter) 
    external 
    view 
    returns (bool) 
  {
    return hasVoted[_proposalId][_voter];
  }
}

/*
DEPLOYMENT INSTRUCTIONS FOR SEPOLIA TESTNET:

1. Get Sepolia Testnet Wallet:
   - Use MetaMask and add Sepolia network
   - Get test ETH from faucet: https://sepoliafaucet.com

2. Deploy Contract:
   - Use Remix IDE: https://remix.ethereum.org
   - Paste this code
   - Set _governanceToken to any ERC20 token address on Sepolia
     (or deploy a mock ERC20 first)
   - Deploy to Sepolia

3. Update Environment:
   - Save contract address to .env
   - VITE_GOVERNANCE_CONTRACT=<deployed_address>
   - VITE_RPC_ENDPOINT=https://sepolia.infura.io/v3/<YOUR_KEY>

4. Test:
   - Call createProposal() to create proposals
   - Call submitVote() to vote
   - Watch events in Sepolia Etherscan
*/
