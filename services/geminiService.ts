
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function suggestTags(campaignName: string, existingTags: string[]) {
  try {
    /* Updated model to gemini-3-pro-preview for advanced semantic analysis as described in the UI */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `你是一个专业的广告优化师。根据广告系列名称 "${campaignName}"，从以下候选标签列表中选择最合适的标签：${existingTags.join(', ')}。请只返回匹配的标签名称，以 JSON 数组格式输出。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    // Fix: text property might be undefined, so we check it before calling trim() or JSON.parse()
    const text = response.text;
    if (!text) {
      return [];
    }

    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini 建议出错:", error);
    return [];
  }
}
