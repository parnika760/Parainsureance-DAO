/**
 * Utility functions for the insurance application
 */

import { ethers } from 'ethers';

/**
 * Format ETH amount to readable string
 */
export const formatETH = (wei: string | bigint, decimals: number = 2): string => {
  const eth = ethers.formatEther(wei);
  return parseFloat(eth).toFixed(decimals);
};

/**
 * Format address to shorter version
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format number to thousands separator
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Get Etherscan URL for address or transaction
 */
export const getEtherscanUrl = (hash: string, type: 'address' | 'tx' = 'tx'): string => {
  const baseUrl = 'https://sepolia.etherscan.io';
  return `${baseUrl}/${type}/${hash}`;
};

/**
 * Validate farm location string
 */
export const isValidLocation = (location: string): boolean => {
  return location.trim().length > 0 && location.length <= 100;
};

/**
 * Validate rainfall amount
 */
export const isValidRainfall = (rainfall: number): boolean => {
  return rainfall >= 0 && rainfall <= 500;
};

/**
 * Validate ETH amount
 */
export const isValidETHAmount = (amount: string): boolean => {
  try {
    const parsed = parseFloat(amount);
    return !isNaN(parsed) && parsed > 0 && parsed <= 1000;
  } catch {
    return false;
  }
};

/**
 * Calculate estimated return on investment
 */
export const calculateEstimatedROI = (principalETH: number, annualRate: number = 0.15): number => {
  return principalETH * annualRate;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
    case 'active':
      return 'text-emerald-400';
    case 'pending':
      return 'text-yellow-400';
    case 'failed':
    case 'inactive':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

/**
 * Sleep utility for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry logic for async operations
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delayMs * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  throw lastError;
};
