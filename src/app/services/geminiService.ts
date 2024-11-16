import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error(
    "Missing Gemini API key - please add NEXT_PUBLIC_GEMINI_API_KEY to .env.local"
  );
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export const geminiService = {
  async generateProjectReport(projectData: any): Promise<string> {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-002",
    });

    const prompt = `
    Analyze this project data and create a comprehensive report. Include:
    1. Project Overview
    2. Progress Analysis
    3. Timeline Status
    4. Key Achievements
    5. Recommendations

    Project Data:
    ${JSON.stringify(projectData, null, 2)}
    sau đó chuyển sang tiếng việt
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  },
};
