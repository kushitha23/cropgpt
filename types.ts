export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum View {
  Dashboard = 'dashboard',
  Scanner = 'scanner',
  Chatbot = 'chatbot',
}

export type Language = 'en' | 'hi' | 'ta' | 'pa' | 'bn' | 'mr' | 'te'; // English, Hindi, Tamil, Punjabi, Bengali, Marathi, Telugu

export interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: {
    day: string;
    temp: number;
    condition: string;
  }[];
}

export interface MarketPriceData {
  crop: string;
  price: string;
  market: string;
  lastUpdated: string;
}

export interface YieldData {
  crop: string;
  averageYield: string;
  potentialYield: string;
  factors: string[];
}

export interface WaterData {
  crop: string;
  waterRequirement: string;
  farmingTips: string[];
}

export interface GovernmentScheme {
  name: string;
  description: string;
  eligibility: string;
  link: string;
}

export interface GovernmentSchemeData {
  schemes: GovernmentScheme[];
}


export interface CropScanResult {
  cropName: string;
  healthStatus: string;
  disease: string;
  recommendations: string[];
  fertilizers?: string[];
  pesticides?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FarmingTask {
  timeframe: string;
  task: string;
  details: string;
}

export interface FarmingCalendarData {
  crop: string;
  schedule: FarmingTask[];
}