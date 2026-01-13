import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const getApiKey = (apiKey?: string): string => {
  const trimmedKey = apiKey?.trim();
  if (trimmedKey) {
    return trimmedKey;
  }

  if (process.env.API_KEY) {
    return process.env.API_KEY;
  }

  throw new Error("Missing Gemini API key");
};

export const analyzeReport = async (reportText: string, apiKey?: string): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey(apiKey) });
    const prompt = `
      Act as a Senior Building Automation Systems (BAS) Operations Manager and Safety Compliance Officer.
      Audit this field service report: "${reportText}"

      Analyze for:
      1. SAFETY (CRITICAL): Check for bypassed interlocks, disabled safeties (freeze stats, high static), forced outputs without verification.
      2. TECHNICAL KNOWLEDGE: Score 1-5. Did they troubleshoot logic/sequence or just symptoms?
      3. PROFESSIONALISM: Score 1-5. Is it clear and objective?
      4. FOLLOW-UP: Is further action required based on the report?
      5. REWRITE: Rewrite the report to be client-ready. It must be professional, clear, and technically accurate. 
         IMPORTANT: Use Markdown formatting for the rewrite. 
         - Use **bold** for key metrics or equipment names. 
         - Use bullet points (- ) for lists of actions taken.
         - Use headers (###) for sections if needed.

      Return a JSON object matching this schema:
      {
        "isSafe": boolean,
        "safetyRiskDescription": string (only if unsafe, explain exactly what is compromised),
        "technicalScore": number (1-5),
        "technicalAnalysis": string,
        "professionalismScore": number (1-5),
        "professionalismAnalysis": string,
        "overridesActive": boolean,
        "overridesList": string[] (list points left in Hand/Manual),
        "networkIssues": boolean,
        "followUpRequired": boolean,
        "followUpDetails": string (if required, explain what needs to be done. IMPORTANT: Use **bold** for equipment names and system names),
        "coachFeedback": string,
        "clientRewrite": string
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Audit failed:", error);
    throw error;
  }
};
