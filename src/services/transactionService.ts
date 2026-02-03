import { TransactionLog } from '../types/contracts';

/**
 * Transaction history tracking service
 */
export class TransactionService {
  private transactions: TransactionLog[] = [];
  private maxHistorySize = 50;

  /**
   * Log a transaction
   */
  logTransaction(log: Omit<TransactionLog, 'id'>): TransactionLog {
    const transaction: TransactionLog = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...log,
    };

    this.transactions.unshift(transaction);

    // Keep only recent transactions in memory
    if (this.transactions.length > this.maxHistorySize) {
      this.transactions = this.transactions.slice(0, this.maxHistorySize);
    }

    // Save to localStorage
    this.saveToStorage();

    return transaction;
  }

  /**
   * Get all transactions
   */
  getTransactions(): TransactionLog[] {
    return this.transactions;
  }

  /**
   * Get transactions by type
   */
  getTransactionsByType(type: TransactionLog['type']): TransactionLog[] {
    return this.transactions.filter(tx => tx.type === type);
  }

  /**
   * Update transaction status
   */
  updateTransactionStatus(
    id: string,
    status: TransactionLog['status'],
    txHash?: string
  ): TransactionLog | null {
    const transaction = this.transactions.find(tx => tx.id === id);
    if (transaction) {
      transaction.status = status;
      if (txHash) transaction.txHash = txHash;
      this.saveToStorage();
      return transaction;
    }
    return null;
  }

  /**
   * Clear transaction history
   */
  clearHistory(): void {
    this.transactions = [];
    this.saveToStorage();
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('insurance_transactions', JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Error saving transactions to storage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('insurance_transactions');
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading transactions from storage:', error);
    }
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const total = this.transactions.length;
    const confirmed = this.transactions.filter(tx => tx.status === 'confirmed').length;
    const pending = this.transactions.filter(tx => tx.status === 'pending').length;
    const failed = this.transactions.filter(tx => tx.status === 'failed').length;

    const totalAmount = this.transactions
      .filter(tx => tx.amount && tx.status === 'confirmed')
      .reduce((sum, tx) => sum + (parseFloat(tx.amount || '0')), 0);

    return {
      total,
      confirmed,
      pending,
      failed,
      totalAmount,
    };
  }
}

export const transactionService = new TransactionService();
transactionService.loadFromStorage();
