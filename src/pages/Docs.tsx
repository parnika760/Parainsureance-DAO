/*
  COMPONENT: DocsPage
  DESCRIPTION: A documentation guide for new users on how to use the ParaShield platform.
  
  SECTIONS:
  1. "How it Works" (Grid of 3 cards):
     - Step 1: Get Sepolia ETH (explain it's test money).
     - Step 2: Connect Wallet & Buy Policy (0.01 ETH).
     - Step 3: Automatic Payout (triggered by Chainlink data).
  2. "FAQ" (List):
     - Explain "Parametric Insurance" (pays based on data, not damage assessments).
     - Explain "Smart Contract" safety.
  
  STYLE:
  - Dark theme, Slate-900 background, Emerald-400 accents.
  - Use clear, simple language for non-technical users.
  - Use Lucide-React icons for visual appeal.
*/

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { 
  Wallet, 
  Zap, 
  Cloud, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  AlertCircle,
  DollarSign,
  CheckCircle
} from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const Docs = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'What is Sepolia ETH and where do I get it?',
      answer: 'Sepolia is Ethereum\'s testnet where you can practice without spending real money. Think of it as "play money" for testing. You can get free Sepolia ETH from faucets like Sepolia Faucet, Infura Faucet, or Alchemy Faucet. Just enter your wallet address and you\'ll receive test ETH instantly. This is only for testing on the Sepolia network.'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I connect my wallet?',
      answer: 'Click the "Connect Wallet" button in the top navigation. MetaMask will pop up asking you to approve the connection. Make sure you\'re on the Sepolia testnet before connecting. Once connected, your wallet address will appear in the header, and you can start purchasing policies.'
    },
    {
      id: 3,
      category: 'Insurance',
      question: 'What is Parametric Insurance?',
      answer: 'Parametric insurance is different from traditional insurance. Instead of claiming damage and waiting for assessments, parametric policies pay automatically based on real data (like rainfall, temperature, or wind speed). If weather conditions meet the trigger threshold, you get paid instantly without paperwork. It\'s faster, fairer, and more transparent.'
    },
    {
      id: 4,
      category: 'Insurance',
      question: 'How much does a policy cost?',
      answer: 'Each policy costs 0.01 Sepolia ETH (test money). This covers you for 12 months. If weather triggers your policy\'s conditions (like rainfall exceeding 120mm), you\'ll receive an automatic payout of 0.01 ETH - the same amount you paid. This is just test coverage on the Sepolia network.'
    },
    {
      id: 5,
      category: 'Insurance',
      question: 'How do payouts work?',
      answer: 'Our smart contract uses Chainlink oracles to continuously monitor weather data. When conditions meet your policy\'s trigger (like extreme rainfall, temperature, or drought), the contract automatically triggers and sends your payout. No waiting, no claims forms - just automatic compensation based on real weather data.'
    },
    {
      id: 6,
      category: 'Security',
      question: 'Are my funds safe in a smart contract?',
      answer: 'Yes! Smart contracts are self-executing code that runs exactly as programmed. Your policy and funds are controlled by the contract, not by any company. Once you purchase a policy, the terms are locked in - they can\'t be changed. The contract is transparent and auditable by anyone on the blockchain.'
    },
    {
      id: 7,
      category: 'Security',
      question: 'What if I lose my wallet access?',
      answer: 'If you lose access to your wallet (lose your seed phrase), you also lose access to your policies. There\'s no "forgot password" - this is why it\'s crucial to securely back up your MetaMask seed phrase. Store it safely offline. Never share it with anyone, including ParaShield staff.'
    },
    {
      id: 8,
      category: 'Technical',
      question: 'What is a blockchain and why use it?',
      answer: 'A blockchain is a transparent, permanent ledger of transactions. Using blockchain for insurance means: (1) You control your funds, (2) No middleman takes fees, (3) All transactions are transparent and verifiable, (4) Payments are automatic and fast. It\'s decentralized, meaning no single company controls it.'
    }
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Getting Started':
        return 'text-blue-400';
      case 'Insurance':
        return 'text-emerald-400';
      case 'Security':
        return 'text-yellow-400';
      case 'Technical':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Learn how ParaShield works and start protecting your farm with parametric insurance
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center flex items-center justify-center gap-3">
            <Zap className="w-8 h-8 text-emerald-400" />
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Get Sepolia ETH */}
            <div className="glass-card border border-blue-400 border-opacity-30 hover:border-opacity-100 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg mb-4">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Step 1: Get Sepolia ETH</h3>
              <p className="text-gray-300 mb-4">
                Sepolia ETH is free test money for the Ethereum testnet. It's not real money, just for practicing.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Free & Easy</p>
                    <p className="text-sm text-gray-400">Get it from a faucet in seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Test Only</p>
                    <p className="text-sm text-gray-400">No real value, just for testing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Try Everything</p>
                    <p className="text-sm text-gray-400">Risk-free experimentation</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500 bg-opacity-10 border border-blue-400 border-opacity-20 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  💡 <strong>Tip:</strong> Visit Sepolia Faucet or Infura Faucet to claim free Sepolia ETH
                </p>
              </div>
            </div>

            {/* Step 2: Connect & Buy */}
            <div className="glass-card border border-emerald-400 border-opacity-30 hover:border-opacity-100 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-500 bg-opacity-20 rounded-lg mb-4">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Step 2: Connect Wallet & Buy</h3>
              <p className="text-gray-300 mb-4">
                Connect MetaMask and purchase a weather protection policy for 0.01 Sepolia ETH.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Click Connect</p>
                    <p className="text-sm text-gray-400">Approve MetaMask popup</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Pick a Policy</p>
                    <p className="text-sm text-gray-400">Choose your weather protection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Sign & Pay</p>
                    <p className="text-sm text-gray-400">Confirm transaction in MetaMask</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500 bg-opacity-10 border border-emerald-400 border-opacity-20 rounded-lg p-4">
                <p className="text-sm text-emerald-300">
                  💡 <strong>Cost:</strong> 0.01 Sepolia ETH + gas fees
                </p>
              </div>
            </div>

            {/* Step 3: Automatic Payout */}
            <div className="glass-card border border-yellow-400 border-opacity-30 hover:border-opacity-100 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-lg mb-4">
                <Cloud className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Step 3: Automatic Payout</h3>
              <p className="text-gray-300 mb-4">
                Our oracle monitors weather 24/7. When conditions trigger, you get paid automatically.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Real-Time Monitoring</p>
                    <p className="text-sm text-gray-400">Chainlink checks weather data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Automatic Payment</p>
                    <p className="text-sm text-gray-400">No claims needed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Instant Settlement</p>
                    <p className="text-sm text-gray-400">Fast blockchain transactions</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500 bg-opacity-10 border border-yellow-400 border-opacity-20 rounded-lg p-4">
                <p className="text-sm text-yellow-300">
                  💡 <strong>Payout:</strong> 0.01 Sepolia ETH when triggered
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white mb-12 text-center flex items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-emerald-400" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="glass-card border border-gray-700 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full flex items-start justify-between gap-4 p-6 hover:bg-dark-800 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4 text-left flex-1">
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full bg-dark-800 ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </div>
                    <h3 className="text-lg font-semibold text-white pt-1">{item.question}</h3>
                  </div>
                  {expandedFAQ === item.id ? (
                    <ChevronUp className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                  )}
                </button>

                {expandedFAQ === item.id && (
                  <div className="border-t border-gray-700 bg-dark-800 p-6">
                    <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Concepts Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Key Concepts</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parametric Insurance */}
            <div className="glass-card border border-emerald-400 border-opacity-30 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h3 className="text-2xl font-bold text-white">Parametric Insurance</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Instead of traditional insurance that requires damage assessment, parametric insurance pays based on predetermined conditions being met.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong className="text-emerald-400">Traditional:</strong> Assess damage → File claim → Wait for approval → Get paid</p>
                <p><strong className="text-emerald-400">Parametric:</strong> Condition triggered → Automatic payment (no assessment needed)</p>
              </div>
            </div>

            {/* Smart Contracts */}
            <div className="glass-card border border-blue-400 border-opacity-30 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Smart Contracts</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Smart contracts are self-executing programs on the blockchain. Once deployed, they run exactly as coded with no human intervention.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong className="text-blue-400">✓</strong> Transparent and auditable by anyone</p>
                <p><strong className="text-blue-400">✓</strong> Cannot be changed or stopped</p>
                <p><strong className="text-blue-400">✓</strong> Execute automatically when conditions are met</p>
              </div>
            </div>

            {/* Chainlink Oracles */}
            <div className="glass-card border border-purple-400 border-opacity-30 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="w-6 h-6 text-purple-400" />
                <h3 className="text-2xl font-bold text-white">Chainlink Oracles</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Oracles are trusted data providers that feed real-world information (weather, prices, etc.) to blockchain smart contracts.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong className="text-purple-400">Role:</strong> Bridge between real-world and blockchain</p>
                <p><strong className="text-purple-400">Data:</strong> Weather, prices, sports scores, etc.</p>
                <p><strong className="text-purple-400">Verification:</strong> Decentralized and tamper-proof</p>
              </div>
            </div>

            {/* Testnet vs Mainnet */}
            <div className="glass-card border border-yellow-400 border-opacity-30 p-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white">Testnet vs Mainnet</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Sepolia is Ethereum's testnet - a practice environment with free ETH for learning and testing.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong className="text-yellow-400">Testnet (Sepolia):</strong> Practice environment, free ETH, no real value</p>
                <p><strong className="text-yellow-400">Mainnet:</strong> Production environment, real ETH, real money</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="glass-card border border-emerald-400 border-opacity-30 p-8 text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            ParaShield is here to help. Check our support resources or reach out to our team for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Contact Support
            </button>
            <button className="btn-secondary">
              View Tutorials
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
