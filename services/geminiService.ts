import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, CropScanResult, MarketPriceData, WeatherData, YieldData, WaterData, GovernmentSchemeData, FarmingCalendarData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
let chat: Chat | null = null;

const getChat = () => {
    if(!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are CropGPT, a friendly and expert agricultural assistant. Provide concise, helpful, and accurate information to farmers. If asked for data like prices or weather, explain that you're providing simulated data based on typical conditions unless you can ground your answer. When analyzing images, be thorough. Format your responses in clear markdown.`,
            },
        });
    }
    return chat;
}

const parseJsonResponse = <T,>(text: string, fallback: T): T => {
  try {
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    console.error("Original text:", text);
    return fallback;
  }
};

export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData | null> => {
  const prompt = `Provide current weather and a 5-day forecast for latitude ${lat} and longitude ${lon}. Respond with ONLY a JSON object in the following format: {"city": "string", "temperature": number, "condition": "string", "humidity": number, "windSpeed": number, "forecast": [{"day": "string", "temp": number, "condition": "string"}]}`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return parseJsonResponse<WeatherData | null>(response.text, null);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

export const getWeatherDataByCity = async (city: string): Promise<WeatherData | null> => {
  const prompt = `Provide current weather and a 5-day forecast for the city: ${city}. Respond with ONLY a JSON object in the following format: {"city": "string", "temperature": number, "condition": "string", "humidity": number, "windSpeed": number, "forecast": [{"day": "string", "temp": number, "condition": "string"}]}`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return parseJsonResponse<WeatherData | null>(response.text, null);
  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error);
    return null;
  }
};

export const getMarketPriceData = async (crop: string, city: string, state: string): Promise<MarketPriceData | null> => {
    const prompt = `What is the current market price for ${crop} in ${city}, ${state}, India? Provide a realistic estimate. Respond with ONLY a JSON object in the following format: {"crop": "string", "price": "string", "market": "string", "lastUpdated": "string"}`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return parseJsonResponse<MarketPriceData | null>(response.text, null);
    } catch (error) {
        console.error("Error fetching market price data:", error);
        return null;
    }
}

export const getYieldData = async (crop: string): Promise<YieldData | null> => {
    const prompt = `Provide typical yield production data for ${crop} in India. Respond with ONLY a JSON object in the following format: {"crop": "string", "averageYield": "string", "potentialYield": "string", "factors": ["string", "string"]}`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return parseJsonResponse<YieldData | null>(response.text, null);
    } catch (error) {
        console.error("Error fetching yield data:", error);
        return null;
    }
}

export const getWaterContentData = async (crop: string): Promise<WaterData | null> => {
    const prompt = `Provide the water requirements for growing ${crop} in India, including helpful farming tips. Respond with ONLY a JSON object in the following format: {"crop": "string", "waterRequirement": "string", "farmingTips": ["string", "string"]}`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return parseJsonResponse<WaterData | null>(response.text, null);
    } catch (error) {
        console.error("Error fetching water content data:", error);
        return null;
    }
}

export const getGovernmentSchemes = async (): Promise<GovernmentSchemeData | null> => {
    const prompt = `List the top 5-7 major government schemes available for farmers in India. For each scheme, provide its name, a brief description, eligibility criteria, and an official link if available. Respond with ONLY a JSON object in the following format: {"schemes": [{"name": "string", "description": "string", "eligibility": "string", "link": "string"}]}`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return parseJsonResponse<GovernmentSchemeData | null>(response.text, null);
    } catch (error) {
        console.error("Error fetching government schemes:", error);
        return null;
    }
}

export const getFarmingCalendar = async (crop: string): Promise<FarmingCalendarData | null> => {
    const prompt = `Provide a generalized, week-by-week farming schedule for growing ${crop} in India, starting from land preparation to harvest. The schedule should be practical for a typical farmer. Respond with ONLY a JSON object in the following format: {"crop": "string", "schedule": [{"timeframe": "string", "task": "string", "details": "string"}]}`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return parseJsonResponse<FarmingCalendarData | null>(response.text, null);
    } catch (error) {
        console.error("Error fetching farming calendar data:", error);
        return null;
    }
}

export const analyzeCropImage = async (base64Image: string): Promise<CropScanResult | null> => {
    const prompt = `Analyze this image of a crop. Identify the crop, its health status, and any visible diseases or deficiencies. Provide practical recommendations, including specific fertilizer and pesticide names if applicable. Respond with ONLY a JSON object in the following format: {"cropName": "string", "healthStatus": "string", "disease": "string", "recommendations": ["string", "string"], "fertilizers": ["string"], "pesticides": ["string"]}`;
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
        }
    };
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [ {text: prompt}, imagePart ] },
        });
        return parseJsonResponse<CropScanResult | null>(response.text, null);
    } catch (error) {
        console.error("Error analyzing crop image:", error);
        return null;
    }
}

export const sendChatMessage = async (message: string): Promise<string> => {
    try {
        const chat = getChat();
        const response = await chat.sendMessage({ message: message });
        return response.text;
    } catch (error) {
        console.error("Error in chat:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
}