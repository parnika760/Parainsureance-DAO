import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractService } from '../services/contractService';
import { transactionService } from '../services/transactionService';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface Web3ContextType {
  account: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  balance: string | null;
  ethPrice: number | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  const fetchBalance = useCallback(async (provider: ethers.Provider, address: string) => {
    try {
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, []);

  const fetchEthPrice = useCallback(async () => {
    try {
      const price = await contractService.getETHPrice();
      setEthPrice(price.price);
    } catch (error) {
      console.error('Error fetching ETH price:', error);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask is not installed');
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const network = await newProvider.getNetwork();

      // Initialize contract service
      contractService.setProvider(newProvider);
      contractService.setSigner(newSigner);

      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));

      // Fetch initial data
      fetchBalance(newProvider, accounts[0]);
      fetchEthPrice();

      // Set up event listeners for account and chain changes
      window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(newAccounts[0]);
          fetchBalance(newProvider, newAccounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance, fetchEthPrice]);

  // Refresh ETH price periodically
  useEffect(() => {
    if (provider) {
      fetchEthPrice();
      const interval = setInterval(fetchEthPrice, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [provider, fetchEthPrice]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance(null);
    setEthPrice(null);
    if (window.ethereum) {
      window.ethereum.removeAllListeners?.();
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnecting,
        isConnected: !!account,
        connectWallet,
        disconnectWallet,
        provider,
        signer,
        chainId,
        balance,
        ethPrice,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};
