import axios from 'axios';

// ADP API configuration
const ADP_AUTH_URL = 'https://accounts.adp.com/auth/oauth/v2/token';
const ADP_API_BASE_URL = 'https://api.adp.com';

// Workforce Now API endpoints
const WFN_ENDPOINTS = {
  workers: '/hr/v2/workers',
  payroll: '/payroll/v1/workers',
  timeAndAttendance: '/time/v2/workers',
  benefits: '/benefits/v1/workers',
};

interface ADPCredentials {
  clientId: string;
  clientSecret: string;
}

interface ADPTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

class ADPService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string = "";
  private tokenExpiry: number = 0;
  private product: string;

  constructor(credentials: ADPCredentials, product: string = 'Workforce Now') {
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
    this.product = product;
  }

  /**
   * Get an OAuth 2.0 access token from ADP
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // Request new token
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post<ADPTokenResponse>(
        ADP_AUTH_URL,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`
          }
        }
      );

      // Store token and expiry
      this.accessToken = response.data.access_token;
      // Set expiry time (subtract 60 seconds for safety margin)
      this.tokenExpiry = now + (response.data.expires_in - 60) * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting ADP access token:', error);
      throw new Error('Failed to authenticate with ADP API');
    }
  }

  /**
   * Create an authenticated API client
   */
  private async createApiClient() {
    const token = await this.getAccessToken();
    
    return axios.create({
      baseURL: ADP_API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get worker information from ADP
   */
  async getWorkers(limit: number = 10) {
    try {
      const client = await this.createApiClient();
      const endpoint = this.product === 'Workforce Now' ? 
        WFN_ENDPOINTS.workers : '/hr/v2/workers'; // Fallback endpoint
      
      const response = await client.get(`${endpoint}`, {
        params: {
          $top: limit,
          $skip: 0
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching workers from ADP:', error);
      throw error;
    }
  }

  /**
   * Get payroll information from ADP
   */
  async getPayrollData(workerId?: string) {
    try {
      const client = await this.createApiClient();
      const endpoint = this.product === 'Workforce Now' ? 
        WFN_ENDPOINTS.payroll : '/payroll/v1/workers';
      
      // If workerId is provided, get specific worker's payroll data
      const url = workerId ? `${endpoint}/${workerId}` : endpoint;
      
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll data from ADP:', error);
      throw error;
    }
  }

  /**
   * Get time and attendance data from ADP
   */
  async getTimeAndAttendance(startDate?: string, endDate?: string) {
    try {
      const client = await this.createApiClient();
      const endpoint = this.product === 'Workforce Now' ? 
        WFN_ENDPOINTS.timeAndAttendance : '/time/v2/workers';
      
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching time and attendance data from ADP:', error);
      throw error;
    }
  }

  /**
   * Get benefits information from ADP
   */
  async getBenefitsData() {
    try {
      const client = await this.createApiClient();
      const endpoint = this.product === 'Workforce Now' ? 
        WFN_ENDPOINTS.benefits : '/benefits/v1/workers';
      
      const response = await client.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching benefits data from ADP:', error);
      throw error;
    }
  }

  /**
   * Test the connection to ADP API
   */
  async testConnection() {
    try {
      await this.getAccessToken();
      return {
        success: true,
        message: 'Successfully connected to ADP API'
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to connect to ADP API: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export default ADPService;
