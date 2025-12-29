
import { GoogleGenAI, Type } from "@google/genai";
import { AIDiagnosis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIDiagnosis = async (complaint: string): Promise<AIDiagnosis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Diagnose this car issue for an auto shop in Ghana. Complaint: "${complaint}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING, description: "A detailed explanation of the likely problem." },
            confidence: { type: Type.NUMBER, description: "Confidence level between 0 and 1." },
            estimatedCostRange: { type: Type.STRING, description: "Estimated cost range in GHS (₵)." },
            suggestedParts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of common parts needed." },
            repairTime: { type: Type.STRING, description: "Estimated time to fix." }
          },
          required: ["diagnosis", "confidence", "estimatedCostRange", "suggestedParts", "repairTime"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Diagnosis Error:", error);
    throw error;
  }
};

export const getAIInsights = async (dataSummary: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3-5 short, actionable business insights for an auto shop manager based on this summary data: ${dataSummary}. Output as a simple bulleted list of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return ["Focus on high-margin repairs this week.", "Check inventory for frequent brake pad replacements.", "Follow up with customers from last month."];
  }
};

export const getInventoryPrediction = async (itemHistory: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Predict stock runout and suggest reorder date for this inventory item history: ${itemHistory}. Keep it under 50 words.`
    });
    return response.text;
  } catch (error) {
    return "Inventory prediction unavailable.";
  }
};
