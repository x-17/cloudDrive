
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

/**
 * SERVERLESS BACKEND LOGIC
 * 
 * This file acts as the interface to our Serverless Function-as-a-Service (FaaS) backend.
 * Each exported function below represents a distinct Microservice that scales independently.
 * 
 * Architecture:
 * Client -> API Gateway (simulated) -> Serverless Functions (Gemini) -> Result
 */

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");
  return new GoogleGenAI({ apiKey });
};

// MICROSERVICE 1: Content Moderation Service
export const performModerationCheck = async (base64Data: string, mimeType: string): Promise<Partial<AIAnalysisResult>> => {
  const ai = getAiClient();
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      isSafe: { type: Type.BOOLEAN, description: "Is this content safe for work?" },
      safetyReason: { type: Type.STRING, description: "Reason if unsafe, or 'Safe' if safe." },
    },
    required: ["isSafe"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: "Analyze this image for sensitive content (violence, adult content, etc). Return JSON." },
        ],
      },
      config: { responseMimeType: "application/json", responseSchema: responseSchema },
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Moderation Service Error", e);
    return { isSafe: true, safetyReason: "Service Unavailable - Defaulting to Safe" };
  }
};

// MICROSERVICE 2: Classification & Organization Service
export const performClassification = async (base64Data: string, mimeType: string): Promise<Partial<AIAnalysisResult>> => {
  const ai = getAiClient();
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 relevant tags." },
      suggestedFolder: { type: Type.STRING, description: "A short folder name (e.g., Finance, Travel)." },
    },
    required: ["tags", "suggestedFolder"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: "Classify this image for a cloud storage system. Return JSON." },
        ],
      },
      config: { responseMimeType: "application/json", responseSchema: responseSchema },
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Classification Service Error", e);
    return { tags: ["uncategorized"], suggestedFolder: "General" };
  }
};

// MICROSERVICE 3: OCR Service
export const performOCR = async (base64Data: string, mimeType: string): Promise<Partial<AIAnalysisResult>> => {
  const ai = getAiClient();
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      extractedText: { type: Type.STRING, description: "All visible text in the image." },
    },
    required: ["extractedText"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: "Extract all text from this image. If no text, return 'No text detected'." },
        ],
      },
      config: { responseMimeType: "application/json", responseSchema: responseSchema },
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("OCR Service Error", e);
    return { extractedText: "OCR Service Timeout" };
  }
};

// MICROSERVICE 4: Metadata & Enrichment Service
export const performMetadataAnalysis = async (base64Data: string, mimeType: string): Promise<Partial<AIAnalysisResult>> => {
  const ai = getAiClient();
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      description: { type: Type.STRING, description: "A concise visual description." },
    },
    required: ["description"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: "Describe this image visually for accessibility alt-text." },
        ],
      },
      config: { responseMimeType: "application/json", responseSchema: responseSchema },
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Metadata Service Error", e);
    return { description: "Description unavailable" };
  }
};
