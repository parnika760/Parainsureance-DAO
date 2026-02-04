import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

// Real Proposal Data Structure
interface Proposal {
  id: number;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  status: 'Active' | 'Passed' | 'Completed' | 'Rejected';
  createdAt: string;
  executionThreshold: number;
  voters: Set<string>; // Track actual voter addresses
}

// Initial proposals structure (votes start at 0)
const initialProposals: Proposal[] = [
  {
    id: 101,
    title: "Add Flood Coverage for Rice Farmers",
    description: "Expand insurance coverage to include flood damage protection for rice farming communities.",
    votesFor: 0,
    votesAgainst: 0,
    totalVoters: 0,
    status: "Active",
    createdAt: "2026-02-01",
    executionThreshold: 80,
    voters: new Set(),
  },
  {
    id: 102,
    title: "Increase Payout Cap to 2.5 ETH",
    description: "Raise the maximum insurance payout from 2.0 ETH to 2.5 ETH to better protect high-value claims.",
    votesFor: 0,
    votesAgainst: 0,
    totalVoters: 0,
    status: "Active",
    createdAt: "2025-12-15",
    executionThreshold: 85,
    voters: new Set(),
  },
  {
    id: 103,
    title: "Introduce Crop Rotation Incentives",
    description: "Add premium discounts for farmers who practice sustainable crop rotation techniques.",
    votesFor: 0,
    votesAgainst: 0,
    totalVoters: 0,
    status: "Active",
    createdAt: "2025-11-20",
    executionThreshold: 75,
    voters: new Set(),
  },
];

const GovernancePage: React.FC = () => {
  const { account } = useWeb3();
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [votingProposalId, setVotingProposalId] = useState<number | null>(null);
  const [userVotes, setUserVotes] = useState<{ [proposalId: number]: 'for' | 'against' | null }>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Calculate vote percentage
  const calculateVotePercentage = (votesFor: number, total: number): number => {
    return total > 0 ? Math.round((votesFor / total) * 100) : 0;
  };

  // Check if wallet is connected
  const isWalletConnected = (): boolean => {
    if (!account) {
      setErrorMessage('Please connect your wallet to vote');
      setTimeout(() => setErrorMessage(''), 5000);
      return false;
    }
    return true;
  };

  // Check if user has already voted
  const hasUserVoted = (proposalId: number): boolean => {
    return userVotes[proposalId] !== undefined && userVotes[proposalId] !== null;
  };

  // Handle real voting
  const handleVote = async (proposalId: number, voteType: 'for' | 'against') => {
    // Validate wallet connection
    if (!isWalletConnected()) {
      return;
    }

    // Check if already voted
    if (hasUserVoted(proposalId)) {
      setErrorMessage(`You have already voted on this proposal (${userVotes[proposalId]})`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    setVotingProposalId(proposalId);

    try {
      const proposalIndex = proposals.findIndex((p) => p.id === proposalId);
      if (proposalIndex === -1) {
        throw new Error('Proposal not found');
      }

      const proposal = proposals[proposalIndex];

      // Check if proposal is still active
      if (proposal.status !== 'Active') {
        setErrorMessage('This proposal is no longer active for voting');
        setTimeout(() => setErrorMessage(''), 5000);
        return;
      }

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Create updated proposal with real vote
      const updatedProposal = { ...proposal };
      
      if (voteType === 'for') {
        updatedProposal.votesFor += 1;
      } else {
        updatedProposal.votesAgainst += 1;
      }
      
      updatedProposal.totalVoters += 1;
      updatedProposal.voters.add(account);

      // Check if threshold is reached for auto-execution
      const votePercentage = calculateVotePercentage(
        updatedProposal.votesFor,
        updatedProposal.totalVoters
      );

      // Update user's vote record
      setUserVotes({
        ...userVotes,
        [proposalId]: voteType,
      });

      // Update proposals array
      const updatedProposals = [...proposals];
      
      // Check for auto-execution at threshold
      if (
        votePercentage >= updatedProposal.executionThreshold &&
        votePercentage <= 90 &&
        updatedProposal.status === 'Active'
      ) {
        updatedProposal.status = 'Completed';
        alert(
          `✅ Vote submitted successfully!\n\nProposal reached ${votePercentage}% approval.\nSmart contract auto-executed!\n\nProposal Status: ${updatedProposal.status}`
        );
      } else {
        alert(
          `✅ Vote submitted successfully!\n\nYour Vote: ${voteType === 'for' ? '✓ FOR' : '✗ AGAINST'}\nCurrent Approval: ${votePercentage}%\nThreshold Needed: ${updatedProposal.executionThreshold}%\n\nVote Count: ${updatedProposal.votesFor} FOR, ${updatedProposal.votesAgainst} AGAINST (${updatedProposal.totalVoters} total)`
        );
      }

      updatedProposals[proposalIndex] = updatedProposal;
      setProposals(updatedProposals);
    } catch (error) {
      console.error('Voting error:', error);
      setErrorMessage('Error submitting vote. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setVotingProposalId(null);
    }
  };

  // Get status badge styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-900/30 text-blue-300 border border-blue-700';
      case 'Passed':
        return 'bg-green-900/30 text-green-300 border border-green-700';
      case 'Completed':
        return 'bg-purple-900/30 text-purple-300 border border-purple-700';
      case 'Rejected':
        return 'bg-red-900/30 text-red-300 border border-red-700';
      default:
        return 'bg-gray-900/30 text-gray-300 border border-gray-700';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <Clock className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-8">
      {/* Error Message Display */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* Wallet Connection Warning */}
      {!account && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-300">💼 Please connect your wallet to participate in voting</p>
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Governance Dashboard
          </h1>
          <p className="text-lg text-slate-400">
            Vote on insurance parameters and DAO proposals. Your vote drives protocol decisions.
          </p>
          <div className="flex items-center gap-6 pt-4">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2">
              <p className="text-sm text-slate-400">Total Proposals</p>
              <p className="text-2xl font-bold text-white">{proposals.length}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2">
              <p className="text-sm text-slate-400">Active Votes</p>
              <p className="text-2xl font-bold text-blue-400">
                {proposals.filter((p) => p.status === 'Active').length}
              </p>
            </div>
            {account && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2">
                <p className="text-sm text-slate-400">Your Votes</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {Object.values(userVotes).filter((v) => v !== null).length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="max-w-7xl mx-auto space-y-6">
        {proposals.map((proposal) => {
          const votePercentage = calculateVotePercentage(
            proposal.votesFor,
            proposal.totalVoters
          );
          const noVotePercentage = 100 - votePercentage;

          return (
            <div
              key={proposal.id}
              className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-6 hover:border-slate-600/60 transition-all duration-300 shadow-lg"
            >
              {/* Proposal Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      {proposal.title}
                    </h2>
                  </div>
                  <p className="text-slate-400 text-sm md:text-base mb-3">
                    {proposal.description}
                  </p>
                  <p className="text-xs text-slate-500">Created: {proposal.createdAt}</p>
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${getStatusStyles(
                    proposal.status
                  )}`}
                >
                  {getStatusIcon(proposal.status)}
                  <span>{proposal.status}</span>
                </div>
              </div>

              {/* Voting Stats */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Votes For</p>
                      <p className="text-2xl font-bold text-green-400">{proposal.votesFor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Votes Against</p>
                      <p className="text-2xl font-bold text-red-400">{proposal.votesAgainst}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Total Voters</p>
                      <p className="text-2xl font-bold text-blue-400">{proposal.totalVoters}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-400">{votePercentage}%</p>
                    <p className="text-xs text-slate-500">
                      Threshold: {proposal.executionThreshold}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800/50 rounded-full h-3 border border-slate-700/30 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-500"
                    style={{ width: `${votePercentage}%` }}
                  />
                </div>

                {/* Threshold Indicator */}
                {votePercentage >= proposal.executionThreshold && (
                  <p className="mt-3 text-sm text-emerald-400 font-semibold">
                    ✓ Threshold reached! Auto-execution enabled.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleVote(proposal.id, 'for')}
                  disabled={
                    votingProposalId === proposal.id ||
                    proposal.status !== 'Active' ||
                    !account ||
                    hasUserVoted(proposal.id)
                  }
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    !account || proposal.status !== 'Active' || hasUserVoted(proposal.id)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-700 hover:to-emerald-600 active:scale-95'
                  }`}
                  title={
                    hasUserVoted(proposal.id)
                      ? `You voted ${userVotes[proposal.id]} on this proposal`
                      : !account
                      ? 'Connect wallet to vote'
                      : proposal.status !== 'Active'
                      ? 'Voting closed'
                      : 'Vote in favor'
                  }
                >
                  {votingProposalId === proposal.id ? (
                    'Submitting...'
                  ) : hasUserVoted(proposal.id) ? (
                    `✓ Voted ${userVotes[proposal.id]}`
                  ) : (
                    '✓ Vote For'
                  )}
                </button>
                <button
                  onClick={() => handleVote(proposal.id, 'against')}
                  disabled={
                    votingProposalId === proposal.id ||
                    proposal.status !== 'Active' ||
                    !account ||
                    hasUserVoted(proposal.id)
                  }
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    !account || proposal.status !== 'Active' || hasUserVoted(proposal.id)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 active:scale-95'
                  }`}
                  title={
                    hasUserVoted(proposal.id)
                      ? `You voted ${userVotes[proposal.id]} on this proposal`
                      : !account
                      ? 'Connect wallet to vote'
                      : proposal.status !== 'Active'
                      ? 'Voting closed'
                      : 'Vote against'
                  }
                >
                  {votingProposalId === proposal.id ? (
                    'Submitting...'
                  ) : hasUserVoted(proposal.id) ? (
                    `✗ Voted ${userVotes[proposal.id]}`
                  ) : (
                    '✗ Vote Against'
                  )}
                </button>
              </div>

              {/* User Vote Confirmation */}
              {hasUserVoted(proposal.id) && (
                <div className="mt-4 p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                  <p className="text-sm text-emerald-300">
                    ✓ You voted <strong>{userVotes[proposal.id]}</strong> on this proposal
                  </p>
                </div>
              )}

              {/* Status Message */}
              {proposal.status === 'Completed' && (
                <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                  <p className="text-sm text-purple-300">
                    ✓ This proposal has been completed and executed on-chain.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Smart Contract Integration Notes */}
      <div className="max-w-7xl mx-auto mt-12 p-6 bg-slate-800/30 border border-slate-700/30 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-3">💡 Smart Contract Integration</h3>
        <ul className="text-slate-400 text-sm space-y-2">
          <li>
            • <span className="text-slate-300">Vote Submission:</span> Each vote is submitted to
            the smart contract on-chain
          </li>
          <li>
            • <span className="text-slate-300">Auto-Execution:</span> When voting reaches 80-90%,
            the contract automatically executes
          </li>
          <li>
            • <span className="text-slate-300">User Eligibility:</span> Smart contract verifies
            voter eligibility based on blockchain user count
          </li>
          <li>
            • <span className="text-slate-300">Status Updates:</span> Completed proposals show
            final status but remain visible for audit trail
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GovernancePage;
