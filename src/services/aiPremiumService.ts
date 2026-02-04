/**
 * AI Premium Calculation Service
 * Calculates insurance premiums based on location risk assessment
 * 
 * Factors considered:
 * - Historical weather patterns
 * - Geographical risk zone
 * - Crop vulnerability
 * - Climate data
 */

export interface LocationRiskData {
  location: string;
  riskScore: number; // 0-100
  baselineRainfall: number; // mm/year
  avgTemperature: number; // °C
  hailRiskLevel: 'low' | 'medium' | 'high'; // percentage
  droughtRiskLevel: 'low' | 'medium' | 'high';
  frostRiskLevel: 'low' | 'medium' | 'high';
  recommendedPremium: string; // in wei/ETH
}

export interface PremiumCalculationInput {
  location: string;
  weatherType: string;
  baselineAmount?: string; // ETH
}

export interface PremiumCalculationResult {
  location: string;
  weatherType: string;
  basePremium: string; // ETH
  riskMultiplier: number;
  finalPremium: string; // ETH in wei
  riskFactors: string[];
  confidence: number; // 0-100
}

class AIPremiumService {
  private riskDatabase: Map<string, LocationRiskData> = new Map();

  constructor() {
    this.initializeRiskDatabase();
  }

  /**
   * Initialize with known geographical risk data
   */
  private initializeRiskDatabase(): void {
    const riskProfiles: Record<string, LocationRiskData> = {
      
      // ==================== INDIA - STATES ====================
      
      // NORTH INDIA
      'punjab': {
        location: 'Punjab',
        riskScore: 55,
        baselineRainfall: 650,
        avgTemperature: 24,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'high',
        recommendedPremium: '0.008',
      },
      'haryana': {
        location: 'Haryana',
        riskScore: 58,
        baselineRainfall: 550,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'high',
        recommendedPremium: '0.009',
      },
      'uttar_pradesh': {
        location: 'Uttar Pradesh',
        riskScore: 52,
        baselineRainfall: 900,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.007',
      },
      'uttarakhand': {
        location: 'Uttarakhand',
        riskScore: 65,
        baselineRainfall: 1500,
        avgTemperature: 18,
        hailRiskLevel: 'high',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'high',
        recommendedPremium: '0.01',
      },
      'himachal_pradesh': {
        location: 'Himachal Pradesh',
        riskScore: 62,
        baselineRainfall: 1200,
        avgTemperature: 15,
        hailRiskLevel: 'high',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'high',
        recommendedPremium: '0.009',
      },
      'jammu_kashmir': {
        location: 'Jammu & Kashmir',
        riskScore: 68,
        baselineRainfall: 1100,
        avgTemperature: 12,
        hailRiskLevel: 'high',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'high',
        recommendedPremium: '0.011',
      },
      'ladakh': {
        location: 'Ladakh',
        riskScore: 72,
        baselineRainfall: 100,
        avgTemperature: 5,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'high',
        recommendedPremium: '0.012',
      },
      'delhi': {
        location: 'Delhi',
        riskScore: 50,
        baselineRainfall: 700,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.007',
      },
      
      // WEST INDIA
      'rajasthan': {
        location: 'Rajasthan',
        riskScore: 75,
        baselineRainfall: 350,
        avgTemperature: 28,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.012',
      },
      'gujarat': {
        location: 'Gujarat',
        riskScore: 60,
        baselineRainfall: 800,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.009',
      },
      'maharashtra': {
        location: 'Maharashtra',
        riskScore: 55,
        baselineRainfall: 1200,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'goa': {
        location: 'Goa',
        riskScore: 45,
        baselineRainfall: 3000,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.006',
      },
      
      // EAST INDIA
      'west_bengal': {
        location: 'West Bengal',
        riskScore: 58,
        baselineRainfall: 1800,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'bihar': {
        location: 'Bihar',
        riskScore: 62,
        baselineRainfall: 1200,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.009',
      },
      'jharkhand': {
        location: 'Jharkhand',
        riskScore: 55,
        baselineRainfall: 1400,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'odisha': {
        location: 'Odisha',
        riskScore: 70,
        baselineRainfall: 1500,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.011',
      },
      
      // SOUTH INDIA
      'andhra_pradesh': {
        location: 'Andhra Pradesh',
        riskScore: 58,
        baselineRainfall: 900,
        avgTemperature: 28,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'telangana': {
        location: 'Telangana',
        riskScore: 55,
        baselineRainfall: 950,
        avgTemperature: 28,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'karnataka': {
        location: 'Karnataka',
        riskScore: 52,
        baselineRainfall: 1200,
        avgTemperature: 26,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      'tamil_nadu': {
        location: 'Tamil Nadu',
        riskScore: 60,
        baselineRainfall: 950,
        avgTemperature: 29,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.009',
      },
      'kerala': {
        location: 'Kerala',
        riskScore: 55,
        baselineRainfall: 3000,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      
      // CENTRAL INDIA
      'madhya_pradesh': {
        location: 'Madhya Pradesh',
        riskScore: 58,
        baselineRainfall: 1100,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.008',
      },
      'chhattisgarh': {
        location: 'Chhattisgarh',
        riskScore: 52,
        baselineRainfall: 1400,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      
      // NORTHEAST INDIA
      'assam': {
        location: 'Assam',
        riskScore: 65,
        baselineRainfall: 2800,
        avgTemperature: 24,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.01',
      },
      'meghalaya': {
        location: 'Meghalaya',
        riskScore: 68,
        baselineRainfall: 4000,
        avgTemperature: 20,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.011',
      },
      'arunachal_pradesh': {
        location: 'Arunachal Pradesh',
        riskScore: 70,
        baselineRainfall: 3000,
        avgTemperature: 18,
        hailRiskLevel: 'high',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'high',
        recommendedPremium: '0.011',
      },
      'nagaland': {
        location: 'Nagaland',
        riskScore: 62,
        baselineRainfall: 2000,
        avgTemperature: 20,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.009',
      },
      'manipur': {
        location: 'Manipur',
        riskScore: 60,
        baselineRainfall: 1500,
        avgTemperature: 21,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.009',
      },
      'mizoram': {
        location: 'Mizoram',
        riskScore: 58,
        baselineRainfall: 2500,
        avgTemperature: 22,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'tripura': {
        location: 'Tripura',
        riskScore: 55,
        baselineRainfall: 2200,
        avgTemperature: 25,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'sikkim': {
        location: 'Sikkim',
        riskScore: 68,
        baselineRainfall: 2500,
        avgTemperature: 15,
        hailRiskLevel: 'high',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'high',
        recommendedPremium: '0.011',
      },
      
      // ==================== MAJOR CITIES ====================
      
      // Punjab Cities
      'ludhiana': {
        location: 'Ludhiana, Punjab',
        riskScore: 55,
        baselineRainfall: 700,
        avgTemperature: 24,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'high',
        recommendedPremium: '0.008',
      },
      'amritsar': {
        location: 'Amritsar, Punjab',
        riskScore: 58,
        baselineRainfall: 600,
        avgTemperature: 24,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'high',
        recommendedPremium: '0.008',
      },
      'jalandhar': {
        location: 'Jalandhar, Punjab',
        riskScore: 54,
        baselineRainfall: 700,
        avgTemperature: 24,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'high',
        recommendedPremium: '0.008',
      },
      'patiala': {
        location: 'Patiala, Punjab',
        riskScore: 52,
        baselineRainfall: 750,
        avgTemperature: 24,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.007',
      },
      'bathinda': {
        location: 'Bathinda, Punjab',
        riskScore: 62,
        baselineRainfall: 400,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'high',
        recommendedPremium: '0.009',
      },
      
      // Haryana Cities
      'chandigarh': {
        location: 'Chandigarh',
        riskScore: 50,
        baselineRainfall: 1100,
        avgTemperature: 23,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.007',
      },
      'gurugram': {
        location: 'Gurugram, Haryana',
        riskScore: 55,
        baselineRainfall: 600,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.008',
      },
      'faridabad': {
        location: 'Faridabad, Haryana',
        riskScore: 52,
        baselineRainfall: 650,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.007',
      },
      'hisar': {
        location: 'Hisar, Haryana',
        riskScore: 65,
        baselineRainfall: 400,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'high',
        recommendedPremium: '0.01',
      },
      'karnal': {
        location: 'Karnal, Haryana',
        riskScore: 55,
        baselineRainfall: 700,
        avgTemperature: 24,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'high',
        recommendedPremium: '0.008',
      },
      
      // Uttar Pradesh Cities
      'lucknow': {
        location: 'Lucknow, UP',
        riskScore: 50,
        baselineRainfall: 1000,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.007',
      },
      'kanpur': {
        location: 'Kanpur, UP',
        riskScore: 52,
        baselineRainfall: 850,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.007',
      },
      'varanasi': {
        location: 'Varanasi, UP',
        riskScore: 55,
        baselineRainfall: 1000,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'agra': {
        location: 'Agra, UP',
        riskScore: 58,
        baselineRainfall: 650,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.008',
      },
      'meerut': {
        location: 'Meerut, UP',
        riskScore: 52,
        baselineRainfall: 800,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.007',
      },
      'allahabad': {
        location: 'Prayagraj, UP',
        riskScore: 55,
        baselineRainfall: 1000,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'gorakhpur': {
        location: 'Gorakhpur, UP',
        riskScore: 60,
        baselineRainfall: 1400,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.009',
      },
      
      // Rajasthan Cities
      'jaipur': {
        location: 'Jaipur, Rajasthan',
        riskScore: 65,
        baselineRainfall: 500,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.01',
      },
      'jodhpur': {
        location: 'Jodhpur, Rajasthan',
        riskScore: 75,
        baselineRainfall: 300,
        avgTemperature: 28,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.012',
      },
      'udaipur': {
        location: 'Udaipur, Rajasthan',
        riskScore: 60,
        baselineRainfall: 600,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.009',
      },
      'kota': {
        location: 'Kota, Rajasthan',
        riskScore: 62,
        baselineRainfall: 700,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.009',
      },
      'bikaner': {
        location: 'Bikaner, Rajasthan',
        riskScore: 78,
        baselineRainfall: 250,
        avgTemperature: 28,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.013',
      },
      'jaisalmer': {
        location: 'Jaisalmer, Rajasthan',
        riskScore: 82,
        baselineRainfall: 150,
        avgTemperature: 29,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.014',
      },
      
      // Maharashtra Cities
      'mumbai': {
        location: 'Mumbai, Maharashtra',
        riskScore: 55,
        baselineRainfall: 2400,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'pune': {
        location: 'Pune, Maharashtra',
        riskScore: 48,
        baselineRainfall: 700,
        avgTemperature: 25,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.006',
      },
      'nagpur': {
        location: 'Nagpur, Maharashtra',
        riskScore: 55,
        baselineRainfall: 1100,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'nashik': {
        location: 'Nashik, Maharashtra',
        riskScore: 52,
        baselineRainfall: 800,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      'aurangabad': {
        location: 'Aurangabad, Maharashtra',
        riskScore: 58,
        baselineRainfall: 700,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'solapur': {
        location: 'Solapur, Maharashtra',
        riskScore: 65,
        baselineRainfall: 500,
        avgTemperature: 28,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.01',
      },
      'kolhapur': {
        location: 'Kolhapur, Maharashtra',
        riskScore: 50,
        baselineRainfall: 1200,
        avgTemperature: 26,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      
      // Gujarat Cities
      'ahmedabad': {
        location: 'Ahmedabad, Gujarat',
        riskScore: 60,
        baselineRainfall: 800,
        avgTemperature: 28,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.009',
      },
      'surat': {
        location: 'Surat, Gujarat',
        riskScore: 55,
        baselineRainfall: 1200,
        avgTemperature: 28,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'vadodara': {
        location: 'Vadodara, Gujarat',
        riskScore: 52,
        baselineRainfall: 900,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      'rajkot': {
        location: 'Rajkot, Gujarat',
        riskScore: 65,
        baselineRainfall: 500,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.01',
      },
      'bhavnagar': {
        location: 'Bhavnagar, Gujarat',
        riskScore: 62,
        baselineRainfall: 550,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.009',
      },
      'kutch': {
        location: 'Kutch, Gujarat',
        riskScore: 78,
        baselineRainfall: 350,
        avgTemperature: 28,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.013',
      },
      
      // Madhya Pradesh Cities
      'bhopal': {
        location: 'Bhopal, MP',
        riskScore: 52,
        baselineRainfall: 1200,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      'indore': {
        location: 'Indore, MP',
        riskScore: 50,
        baselineRainfall: 1000,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      'jabalpur': {
        location: 'Jabalpur, MP',
        riskScore: 55,
        baselineRainfall: 1400,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'gwalior': {
        location: 'Gwalior, MP',
        riskScore: 58,
        baselineRainfall: 800,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.008',
      },
      
      // Bihar Cities
      'patna': {
        location: 'Patna, Bihar',
        riskScore: 60,
        baselineRainfall: 1100,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.009',
      },
      'gaya': {
        location: 'Gaya, Bihar',
        riskScore: 58,
        baselineRainfall: 1000,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'muzaffarpur': {
        location: 'Muzaffarpur, Bihar',
        riskScore: 65,
        baselineRainfall: 1300,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.01',
      },
      
      // West Bengal Cities
      'kolkata': {
        location: 'Kolkata, West Bengal',
        riskScore: 58,
        baselineRainfall: 1800,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'siliguri': {
        location: 'Siliguri, West Bengal',
        riskScore: 62,
        baselineRainfall: 3000,
        avgTemperature: 24,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.009',
      },
      'durgapur': {
        location: 'Durgapur, West Bengal',
        riskScore: 55,
        baselineRainfall: 1400,
        avgTemperature: 26,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      
      // South India Cities
      'bengaluru': {
        location: 'Bengaluru, Karnataka',
        riskScore: 45,
        baselineRainfall: 900,
        avgTemperature: 24,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.006',
      },
      'mysuru': {
        location: 'Mysuru, Karnataka',
        riskScore: 48,
        baselineRainfall: 800,
        avgTemperature: 25,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.006',
      },
      'hubli': {
        location: 'Hubli, Karnataka',
        riskScore: 55,
        baselineRainfall: 700,
        avgTemperature: 26,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'chennai': {
        location: 'Chennai, Tamil Nadu',
        riskScore: 62,
        baselineRainfall: 1400,
        avgTemperature: 29,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.009',
      },
      'coimbatore': {
        location: 'Coimbatore, Tamil Nadu',
        riskScore: 50,
        baselineRainfall: 700,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      'madurai': {
        location: 'Madurai, Tamil Nadu',
        riskScore: 58,
        baselineRainfall: 850,
        avgTemperature: 29,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'hyderabad': {
        location: 'Hyderabad, Telangana',
        riskScore: 52,
        baselineRainfall: 800,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      'visakhapatnam': {
        location: 'Visakhapatnam, AP',
        riskScore: 65,
        baselineRainfall: 1100,
        avgTemperature: 28,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.01',
      },
      'vijayawada': {
        location: 'Vijayawada, AP',
        riskScore: 58,
        baselineRainfall: 1000,
        avgTemperature: 29,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'kochi': {
        location: 'Kochi, Kerala',
        riskScore: 52,
        baselineRainfall: 3200,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      'thiruvananthapuram': {
        location: 'Thiruvananthapuram, Kerala',
        riskScore: 55,
        baselineRainfall: 1800,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      
      // Northeast Cities
      'guwahati': {
        location: 'Guwahati, Assam',
        riskScore: 62,
        baselineRainfall: 1800,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.009',
      },
      'shillong': {
        location: 'Shillong, Meghalaya',
        riskScore: 65,
        baselineRainfall: 2200,
        avgTemperature: 18,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.01',
      },
      'imphal': {
        location: 'Imphal, Manipur',
        riskScore: 58,
        baselineRainfall: 1400,
        avgTemperature: 21,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.008',
      },
      'agartala': {
        location: 'Agartala, Tripura',
        riskScore: 55,
        baselineRainfall: 2000,
        avgTemperature: 25,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'gangtok': {
        location: 'Gangtok, Sikkim',
        riskScore: 68,
        baselineRainfall: 3500,
        avgTemperature: 15,
        hailRiskLevel: 'high',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'high',
        recommendedPremium: '0.011',
      },
      
      // ==================== AGRICULTURAL DISTRICTS ====================
      
      // Major Agricultural Regions
      'vidarbha': {
        location: 'Vidarbha, Maharashtra',
        riskScore: 72,
        baselineRainfall: 900,
        avgTemperature: 28,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.012',
      },
      'marathwada': {
        location: 'Marathwada, Maharashtra',
        riskScore: 75,
        baselineRainfall: 700,
        avgTemperature: 28,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.012',
      },
      'bundelkhand': {
        location: 'Bundelkhand, UP/MP',
        riskScore: 78,
        baselineRainfall: 850,
        avgTemperature: 27,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.013',
      },
      'malwa': {
        location: 'Malwa, MP',
        riskScore: 55,
        baselineRainfall: 1000,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'doab': {
        location: 'Doab Region, UP',
        riskScore: 50,
        baselineRainfall: 800,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.007',
      },
      'terai': {
        location: 'Terai Region',
        riskScore: 58,
        baselineRainfall: 1600,
        avgTemperature: 25,
        hailRiskLevel: 'medium',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'medium',
        recommendedPremium: '0.008',
      },
      'konkan': {
        location: 'Konkan, Maharashtra',
        riskScore: 52,
        baselineRainfall: 3500,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.007',
      },
      'cauvery_delta': {
        location: 'Cauvery Delta, TN',
        riskScore: 58,
        baselineRainfall: 1000,
        avgTemperature: 28,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'medium',
        frostRiskLevel: 'low',
        recommendedPremium: '0.008',
      },
      'sundarbans': {
        location: 'Sundarbans, WB',
        riskScore: 75,
        baselineRainfall: 1800,
        avgTemperature: 27,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'low',
        frostRiskLevel: 'low',
        recommendedPremium: '0.012',
      },
      
      // ==================== INTERNATIONAL (for reference) ====================
      'california_central_valley': {
        location: 'California Central Valley',
        riskScore: 25,
        baselineRainfall: 250,
        avgTemperature: 18,
        hailRiskLevel: 'low',
        droughtRiskLevel: 'high',
        frostRiskLevel: 'low',
        recommendedPremium: '0.005',
      },
    };

    Object.entries(riskProfiles).forEach(([key, profile]) => {
      this.riskDatabase.set(key, profile);
      // Also add normalized versions
      const normalized = key.toLowerCase().replace(/[_\s-]/g, '');
      this.riskDatabase.set(normalized, profile);
      
      // Add location name as key too
      const locationKey = profile.location.toLowerCase().replace(/[_\s-,]/g, '');
      this.riskDatabase.set(locationKey, profile);
    });
  }

  /**
   * Calculate premium based on location and weather type
   */
  calculatePremium(input: PremiumCalculationInput): PremiumCalculationResult {
    const normalizedLocation = input.location.toLowerCase().replace(/[_\s-]/g, '');
    const riskData = this.findClosestRiskProfile(input.location);

    if (!riskData) {
      // Default calculation for unknown locations
      return this.calculateDefaultPremium(input);
    }

    const basePremium = input.baselineAmount || '0.5';
    const riskMultiplier = this.calculateRiskMultiplier(riskData, input.weatherType);
    const riskFactors = this.extractRiskFactors(riskData, input.weatherType);

    // Convert premium to wei (assuming ETH input)
    const finalPremiumEth = (parseFloat(basePremium) * riskMultiplier).toFixed(4);
    const finalPremiumWei = (parseFloat(finalPremiumEth) * 1e18).toString();

    return {
      location: input.location,
      weatherType: input.weatherType,
      basePremium: basePremium,
      riskMultiplier,
      finalPremium: finalPremiumWei,
      riskFactors,
      confidence: Math.min(95, 70 + riskData.riskScore * 0.3),
    };
  }

  /**
   * Find closest matching risk profile for a location
   */
  private findClosestRiskProfile(location: string): LocationRiskData | null {
    const normalized = location.toLowerCase().replace(/[_\s-]/g, '');
    
    // Exact match
    if (this.riskDatabase.has(normalized)) {
      return this.riskDatabase.get(normalized) || null;
    }

    // Fuzzy match - check if keywords are present
    for (const [key, profile] of this.riskDatabase.entries()) {
      const locationLower = location.toLowerCase();
      const keywordMatch = key.split('_').some(keyword => 
        locationLower.includes(keyword)
      );
      if (keywordMatch) {
        return profile;
      }
    }

    return null;
  }

  /**
   * Calculate risk multiplier based on weather type and location risk
   */
  private calculateRiskMultiplier(
    riskData: LocationRiskData,
    weatherType: string
  ): number {
    const baseFactor = 1 + riskData.riskScore / 200; // 1 to 1.5

    const weatherFactors: Record<string, (data: LocationRiskData) => number> = {
      'excessive_rainfall': (data) => {
        const levels = { low: 1.1, medium: 1.3, high: 1.6 };
        // For rainfall, high baseline rainfall might reduce need
        if (data.baselineRainfall > 800) return 0.9;
        return levels[data.droughtRiskLevel] || 1.2;
      },
      'heat_wave': (data) => {
        return 1.0 + (data.avgTemperature > 20 ? 0.3 : 0.1);
      },
      'hailstorm': (data) => {
        const levels = { low: 1.2, medium: 1.5, high: 2.0 };
        return levels[data.hailRiskLevel] || 1.3;
      },
      'drought': (data) => {
        const levels = { low: 1.1, medium: 1.4, high: 1.9 };
        return levels[data.droughtRiskLevel] || 1.3;
      },
      'frost': (data) => {
        const levels = { low: 1.1, medium: 1.35, high: 1.7 };
        return levels[data.frostRiskLevel] || 1.2;
      },
      'multi_hazard': (data) => {
        // Multi-hazard gets all risk factors
        const levels = { low: 1, medium: 1, high: 1 };
        return (
          1.0 +
          (levels[data.hailRiskLevel] - 1) * 0.4 +
          (levels[data.droughtRiskLevel] - 1) * 0.3 +
          (levels[data.frostRiskLevel] - 1) * 0.3
        );
      },
    };

    const normalized = weatherType.toLowerCase().replace(/\s+/g, '_');
    const weatherFactor = weatherFactors[normalized]?.(riskData) || 1.2;

    return parseFloat((baseFactor * weatherFactor).toFixed(2));
  }

  /**
   * Extract risk factors for display
   */
  private extractRiskFactors(
    riskData: LocationRiskData,
    weatherType: string
  ): string[] {
    const factors: string[] = [];

    if (riskData.droughtRiskLevel === 'high') {
      factors.push('High drought risk');
    }
    if (riskData.hailRiskLevel === 'high') {
      factors.push('High hail risk');
    }
    if (riskData.frostRiskLevel === 'high') {
      factors.push('High frost risk');
    }
    if (riskData.riskScore > 70) {
      factors.push('High-risk geographical area');
    }
    if (riskData.baselineRainfall < 300) {
      factors.push('Low rainfall area');
    }

    return factors.length > 0 ? factors : ['Standard risk profile'];
  }

  /**
   * Default premium calculation for unknown locations
   */
  private calculateDefaultPremium(input: PremiumCalculationInput): PremiumCalculationResult {
    const basePremium = input.baselineAmount || '0.5';
    const weatherMultipliers: Record<string, number> = {
      'excessive_rainfall': 1.3,
      'heat_wave': 1.1,
      'hailstorm': 1.5,
      'drought': 1.4,
      'frost': 1.2,
      'multi_hazard': 1.6,
    };

    const normalized = input.weatherType.toLowerCase().replace(/\s+/g, '_');
    const multiplier = weatherMultipliers[normalized] || 1.3;
    const finalPremiumEth = (parseFloat(basePremium) * multiplier).toFixed(4);
    const finalPremiumWei = (parseFloat(finalPremiumEth) * 1e18).toString();

    return {
      location: input.location,
      weatherType: input.weatherType,
      basePremium: basePremium,
      riskMultiplier: multiplier,
      finalPremium: finalPremiumWei,
      riskFactors: ['Unknown location - standard premium applied'],
      confidence: 45,
    };
  }

  /**
   * Get location suggestions
   */
  getAvailableLocations(): string[] {
    const unique = new Set<string>();
    this.riskDatabase.forEach((data) => {
      unique.add(data.location);
    });
    return Array.from(unique).sort();
  }

  /**
   * Get risk data for a location
   */
  getLocationRiskData(location: string): LocationRiskData | null {
    return this.findClosestRiskProfile(location);
  }
}

// Export singleton instance
export const aiPremiumService = new AIPremiumService();
