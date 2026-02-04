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

// Enhanced Farmer Insurance ABI
const FARMER_INSURANCE_ABI = [
  'function purchasePolicy(string calldata location, uint8 weatherType) external payable',
  'function fulfillWeatherData(address farmer, string calldata reportedLocation, uint256 rainfall, int256 temperature, uint256 windSpeed, bool frostDetected) external',
  'function verifyClaimLocation(address farmer, string calldata claimLocation) external view returns (bool)',
  'function getPolicy(address farmer) external view returns (tuple(address farmer, string location, uint8 weatherType, uint256 premiumPaid, uint256 payoutAmount, bool active, bool paid, uint256 purchaseTime, uint256 claimTime))',
  'function getPoliciesByLocation(string calldata location) external view returns (address[])',
  'function getLocationPolicyCount(string calldata location) external view returns (uint256)',
  'function getFarmerTotalPayouts(address farmer) external view returns (uint256)',
  'function getContractStats() external view returns (uint256 premiumsCollected, uint256 payoutsExecuted, uint256 contractBalance)',
  'function updateOracle(address newOracle) external',
  'function withdrawContractBalance() external',
  'event PolicyPurchased(address indexed farmer, string location, uint8 weatherType, uint256 premium, uint256 payoutAmount)',
  'event WeatherEvaluated(address indexed farmer, string location, uint256 rainfall, int256 temperature, uint256 windSpeed, bool frostDetected)',
  'event PayoutExecuted(address indexed farmer, string location, uint256 payoutAmount)',
  'event LocationClaimVerified(address indexed farmer, string location, bool verified)',
  'event OracleUpdated(address newOracle)',
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
      if (!this.provider) {
        throw new Error('Provider not initialized. Please connect wallet first.');
      }

      // Check network
      const network = await this.provider.getNetwork();
      if (network.chainId !== 11155111n) { // Sepolia testnet chain ID
        throw new Error(`Wrong network! You are on ${network.name} (${network.chainId}). Please switch to Sepolia Testnet (Chain ID: 11155111) in MetaMask.`);
      }

      const contract = this.getContract();
      
      // Verify contract exists by checking code at address
      const code = await this.provider.getCode(this.contractAddress);
      if (code === '0x') {
        throw new Error(`Contract not found at address ${this.contractAddress} on Sepolia Testnet. The contract may not be deployed on this network.`);
      }

      let premium;
      try {
        premium = await contract.PREMIUM();
      } catch (premiumError) {
        console.error('Error fetching premium:', premiumError);
        throw new Error(`Failed to read contract PREMIUM. The contract at ${this.contractAddress} may not have the expected interface.`);
      }

      const tx = await contract.requestPolicy(location, {
        value: premium,
        gasLimit: 500000,
      });

      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error('Transaction failed or was cancelled');
      }
      return receipt.hash;
    } catch (error) {
      console.error('Error requesting policy:', error);
      
      // Provide user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Wrong network') || errorMessage.includes('Sepolia')) {
        throw new Error(errorMessage); // Pass through as-is for network errors
      } else if (errorMessage.includes('BAD_DATA') || errorMessage.includes('decode result')) {
        throw new Error('Contract interface mismatch. The contract may not match the expected insurance contract ABI. Please ensure you are on Sepolia Testnet.');
      } else if (errorMessage.includes('Contract not found') || errorMessage.includes('0x')) {
        throw new Error(`Contract not deployed at address ${this.contractAddress} on Sepolia Testnet.`);
      } else if (errorMessage.includes('insufficient funds')) {
        throw new Error('Insufficient ETH in wallet to cover premium and gas fees.');
      } else if (errorMessage.includes('user rejected')) {
        throw new Error('Transaction was rejected by user in MetaMask.');
      }
      
      throw new Error(errorMessage);
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

  // ================= FARMER INSURANCE METHODS =================

  /**
   * Purchase a farmer insurance policy with AI-calculated premium
   */
  async purchasePolicy(
    location: string,
    weatherType: string,
    premiumWei: string,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARMER_INSURANCE_ABI,
        signer
      );

      // Map weather type string to enum
      const weatherTypeMap: Record<string, number> = {
        'ExcessiveRainfall': 0,
        'HeatWave': 1,
        'Hailstorm': 2,
        'Drought': 3,
        'Frost': 4,
        'MultiHazard': 5,
      };

      const weatherTypeIndex = weatherTypeMap[weatherType] || 3; // Default to Drought

      const tx = await contract.purchasePolicy(location, weatherTypeIndex, {
        value: premiumWei,
        gasLimit: 300000,
      });

      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      return receipt.transactionHash;
    } catch (error: any) {
      console.error('Error purchasing policy:', error);
      
      if (error.message?.includes('Policy already active')) {
        throw new Error('You already have an active policy. Complete or cancel the existing one first.');
      } else if (error.message?.includes('Invalid location')) {
        throw new Error('Invalid location provided');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient ETH balance for premium and gas');
      }
      
      throw error;
    }
  }

  /**
   * Get policy details for a farmer
   */
  async getPolicy(
    farmerAddress: string,
    signer: ethers.Signer
  ): Promise<any> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARMER_INSURANCE_ABI,
        signer
      );

      const policy = await contract.getPolicy(farmerAddress);

      return {
        farmer: policy[0],
        location: policy[1],
        weatherType: ['ExcessiveRainfall', 'HeatWave', 'Hailstorm', 'Drought', 'Frost', 'MultiHazard'][Number(policy[2])],
        premiumPaid: policy[3],
        payoutAmount: policy[4],
        active: policy[5],
        paid: policy[6],
        purchaseTime: Number(policy[7]),
        claimTime: Number(policy[8]),
      };
    } catch (error) {
      console.error('Error fetching policy:', error);
      return null;
    }
  }

  /**
   * Verify that a claim location matches the policy location
   */
  async verifyClaimLocation(
    farmerAddress: string,
    claimLocation: string,
    signer: ethers.Signer
  ): Promise<boolean> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARMER_INSURANCE_ABI,
        signer
      );

      return await contract.verifyClaimLocation(farmerAddress, claimLocation);
    } catch (error) {
      console.error('Error verifying claim location:', error);
      return false;
    }
  }

  /**
   * Get all policies for a specific location
   */
  async getPoliciesByLocation(
    location: string,
    signer: ethers.Signer
  ): Promise<string[]> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARMER_INSURANCE_ABI,
        signer
      );

      return await contract.getPoliciesByLocation(location);
    } catch (error) {
      console.error('Error fetching policies by location:', error);
      return [];
    }
  }

  /**
   * Get location policy count
   */
  async getLocationPolicyCount(
    location: string,
    signer: ethers.Signer
  ): Promise<number> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARMER_INSURANCE_ABI,
        signer
      );

      const count = await contract.getLocationPolicyCount(location);
      return Number(count);
    } catch (error) {
      console.error('Error fetching location policy count:', error);
      return 0;
    }
  }

  /**
   * Get total payouts for a farmer
   */
  async getFarmerTotalPayouts(
    farmerAddress: string,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARMER_INSURANCE_ABI,
        signer
      );

      const payouts = await contract.getFarmerTotalPayouts(farmerAddress);
      return ethers.formatEther(payouts);
    } catch (error) {
      console.error('Error fetching farmer payouts:', error);
      return '0';
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats(signer: ethers.Signer): Promise<{
    premiumsCollected: string;
    payoutsExecuted: string;
    contractBalance: string;
  }> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARMER_INSURANCE_ABI,
        signer
      );

      const [premiumsCollected, payoutsExecuted, contractBalance] = await contract.getContractStats();

      return {
        premiumsCollected: ethers.formatEther(premiumsCollected),
        payoutsExecuted: ethers.formatEther(payoutsExecuted),
        contractBalance: ethers.formatEther(contractBalance),
      };
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      return {
        premiumsCollected: '0',
        payoutsExecuted: '0',
        contractBalance: '0',
      };
    }
  }

  /**
   * Fulfill weather data with location verification (Oracle function)
   */
  async fulfillWeatherData(
    farmer: string,
    location: string,
    rainfall: number,
    temperature: number,
    windSpeed: number,
    frostDetected: boolean,
    signer: ethers.Signer
  ): Promise<string> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        FARMER_INSURANCE_ABI,
        signer
      );

      const tx = await contract.fulfillWeatherData(
        farmer,
        location,
        rainfall,
        temperature,
        windSpeed,
        frostDetected,
        { gasLimit: 500000 }
      );

      const receipt = await tx.wait();
      return receipt?.transactionHash || '';
    } catch (error) {
      console.error('Error fulfilling weather data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const contractService = new ContractService(
  '0x5Cea979df129614c09C6E7AA45b568B37b740726'
);
