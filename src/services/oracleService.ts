import { WeatherData, OracleResponse } from '../types/contracts';

/**
 * Mock Oracle Service for weather data
 * In production, this would call a Chainlink Functions endpoint
 */
export class OracleService {
  private mockWeatherData: Map<string, WeatherData[]> = new Map();

  /**
   * Fetch weather data from API (mock)
   * In production, use Chainlink Functions or API3
   */
  async fetchWeatherData(location: string): Promise<WeatherData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock weather data - replace with real API call
    const mockData: Record<string, WeatherData> = {
      'Sepolia Farm': {
        location: 'Sepolia Farm',
        rainfall: Math.random() * 100,
        timestamp: Date.now(),
        humidity: Math.random() * 100,
        temperature: 20 + Math.random() * 15,
      },
      'Default Farm': {
        location: 'Default Farm',
        rainfall: Math.random() * 100,
        timestamp: Date.now(),
        humidity: Math.random() * 100,
        temperature: 20 + Math.random() * 15,
      },
    };

    return mockData[location] || mockData['Default Farm'];
  }

  /**
   * Store weather history
   */
  storeWeatherData(location: string, data: WeatherData): void {
    if (!this.mockWeatherData.has(location)) {
      this.mockWeatherData.set(location, []);
    }
    this.mockWeatherData.get(location)?.push(data);
  }

  /**
   * Get weather history for a location
   */
  getWeatherHistory(location: string): WeatherData[] {
    return this.mockWeatherData.get(location) || [];
  }

  /**
   * Format weather data for oracle callback
   */
  formatOracleResponse(weatherData: WeatherData): OracleResponse {
    return {
      rainfall: Math.round(weatherData.rainfall * 100) / 100,
      location: weatherData.location,
      timestamp: weatherData.timestamp,
      confirmed: true,
    };
  }

  /**
   * Check if payout should be triggered
   */
  shouldTriggerPayout(rainfall: number, threshold: number): boolean {
    return rainfall >= threshold;
  }
}

export const oracleService = new OracleService();
