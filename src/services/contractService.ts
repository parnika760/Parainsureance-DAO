import { ethers } from 'ethers';
import { PolicyData, WeatherData, OracleResponse } from '../types/contracts';

// Contract ABI for Insurance contract
const INSURANCE_CONTRACT_ABI = [
  // Constants
  'function PREMIUM() public view returns (uint256)',
  'function PAYOUT_AMOUNT() public view returns (uint256)',
  'function RAIN_THRESHOLD() public view returns (uint256)',

  // State variables
  'function farmer() public view returns (address)',
  'function policyActive() public view returns (bool)',
  'function policyPaid() public view returns (bool)',
  'function farmLocation() public view returns (string)',
  'function lastReportedRainfall() public view returns (uint256)',
  'function oracle() public view returns (address)',

  // Functions
  'function requestPolicy(string calldata location) external payable',
  'function fulfillWeather(uint256 rainfall) external',
  'function receive() external payable',

  // Events
  'event PolicyRequested(address indexed farmer, string location)',
  'event WeatherRequested(string location)',
  'event WeatherReceived(uint256 rainfall)',
  'event PayoutTriggered(address indexed farmer, uint256 amount)',
];

// Chainlink AggregatorV3Interface ABI
const AGGREGATOR_ABI = [
  'function decimals() external view returns (uint8)',
  'function description() external view returns (string memory)',
  'function version() external view returns (uint256)',
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
];

export class ContractService {
  private contractAddress: string;
  private priceFeedAddress: string;
  private signer: ethers.Signer | null = null;
  private provider: ethers.Provider | null = null;

  constructor(contractAddress: string, priceFeedAddress: string = '0x694AA1769357215DE4FAC081bf1f309aDC325306') {
    this.contractAddress = contractAddress;
    this.priceFeedAddress = priceFeedAddress;
  }

  setSigner(signer: ethers.Signer): void {
    this.signer = signer;
  }

  setProvider(provider: ethers.Provider): void {
    this.provider = provider;
  }

  private getContract() {
    if (!this.signer) {
      throw new Error('Signer not set. Connect wallet first.');
    }
    return new ethers.Contract(this.contractAddress, INSURANCE_CONTRACT_ABI, this.signer);
  }

  private getPriceFeed() {
    if (!this.provider) {
      throw new Error('Provider not set.');
    }
    return new ethers.Contract(this.priceFeedAddress, AGGREGATOR_ABI, this.provider);
  }

  /**
   * Get current ETH/USD price from Chainlink oracle
   */
  async getETHPrice(): Promise<{
    price: number;
    decimals: number;
    description: string;
  }> {
    try {
      const priceFeed = this.getPriceFeed();
      const [roundId, answer, startedAt, updatedAt, answeredInRound] = await priceFeed.latestRoundData();
      const decimals = await priceFeed.decimals();
      const description = await priceFeed.description();

      const priceInUSD = Number(answer) / Math.pow(10, decimals);

      return {
        price: priceInUSD,
        decimals: decimals,
        description: description,
      };
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      throw error;
    }
  }

  /**
   * Request a policy for a specific farm location
   */
  async requestPolicy(location: string): Promise<string> {
    try {
      const contract = this.getContract();
      const premium = await contract.PREMIUM();

      const tx = await contract.requestPolicy(location, {
        value: premium,
        gasLimit: 500000,
      });

      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error requesting policy:', error);
      throw error;
    }
  }

  /**
   * Get current policy status
   */
  async getPolicyStatus(): Promise<PolicyData> {
    try {
      const contract = this.getContract();
      const signerAddress = await this.signer?.getAddress();

      const farmer = await contract.farmer();
      const policyActive = await contract.policyActive();
      const policyPaid = await contract.policyPaid();
      const farmLocation = await contract.farmLocation();
      const lastReportedRainfall = await contract.lastReportedRainfall();
      const premium = await contract.PREMIUM();
      const payoutAmount = await contract.PAYOUT_AMOUNT();

      return {
        farmer,
        policyActive,
        policyPaid,
        farmLocation,
        lastReportedRainfall: Number(lastReportedRainfall),
        premiumAmount: ethers.formatEther(premium),
        payoutAmount: ethers.formatEther(payoutAmount),
      };
    } catch (error) {
      console.error('Error fetching policy status:', error);
      throw error;
    }
  }

  /**
   * Get contract balance
   */
  async getContractBalance(): Promise<string> {
    try {
      if (!this.provider) throw new Error('Provider not set');
      const balance = await this.provider.getBalance(this.contractAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching contract balance:', error);
      throw error;
    }
  }

  /**
   * Fund the contract with ETH
   */
  async fundContract(amount: string): Promise<string> {
    try {
      if (!this.signer) throw new Error('Signer not set');
      const tx = await this.signer.sendTransaction({
        to: this.contractAddress,
        value: ethers.parseEther(amount),
        gasLimit: 300000,
      });

      const receipt = await tx.wait();
      return receipt?.hash || '';
    } catch (error) {
      console.error('Error funding contract:', error);
      throw error;
    }
  }

  /**
   * Fulfill weather data (Oracle call)
   */
  async fulfillWeather(rainfall: number): Promise<string> {
    try {
      const contract = this.getContract();
      const tx = await contract.fulfillWeather(rainfall, {
        gasLimit: 500000,
      });

      const receipt = await tx.wait();
      return receipt?.hash || '';
    } catch (error) {
      console.error('Error fulfilling weather:', error);
      throw error;
    }
  }

  /**
   * Get rain threshold
   */
  async getRainThreshold(): Promise<number> {
    try {
      const contract = this.getContract();
      const threshold = await contract.RAIN_THRESHOLD();
      return Number(threshold);
    } catch (error) {
      console.error('Error fetching rain threshold:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const contractService = new ContractService(
  '0x5Cea979df129614c09C6E7AA45b568B37b740726'
);
