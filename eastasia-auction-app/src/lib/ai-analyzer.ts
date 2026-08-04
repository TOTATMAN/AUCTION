import OpenAI from "openai";

export interface AIAnalysisResult {
  title: string;
  category: string;
  dynasty: string;
  material: string;
  estimatedAge: string;
  estimatedValue: string;
  condition: string;
  authenticity: string;
  overallScore: number;
  analysisReport: string;
  detailedFindings: {
    surfaceAnalysis: string;
    patternAnalysis: string;
    materialComposition: string;
    historicalContext: string;
    provenanceNotes: string;
    conservationSuggestions: string;
    comparableItems: string[];
    riskFactors: string[];
  };
}

const SYSTEM_PROMPT = `你是「東亞拍賣有限公司」的資深中國文物鑑定專家，擁有40年以上的文物鑑定經驗。
你精通中國歷代文物（包括青銅器、瓷器、玉器、書畫、漆器、金銀器、竹木牙角、紡織品、古錢幣、石雕等）的鑑定。

用戶會提供文物的照片（1-3張不同角度），請你仔細分析照片中的物品，並提供專業的鑑定報告。

請根據照片中實際可見的特徵進行分析，包括：
- 器形、造型特點
- 紋飾、圖案風格
- 材質、色澤、光澤
- 包漿、磨損、老化痕跡
- 工藝技法特徵
- 與已知文物的比對

你必須嚴格以以下JSON格式回覆，不要加入任何其他文字：

{
  "title": "物品名稱（包含推測年代，如：清代青花纏枝蓮紋瓶）",
  "category": "類別（如：瓷器、青銅器、玉器、書畫等）",
  "dynasty": "推測年代（如：清代 (1644-1912年)）",
  "material": "主要材質（如：高嶺土瓷、青銅合金、和田玉等）",
  "estimatedAge": "估計年齡範圍（如：約150-300年）",
  "estimatedValue": "估價範圍（港幣，如：HKD 50,000 - 150,000）",
  "condition": "品相狀況描述",
  "authenticity": "真偽判斷及理由",
  "overallScore": 85,
  "analysisReport": "完整的鑑定報告文字（200-500字，包含詳細分析）",
  "detailedFindings": {
    "surfaceAnalysis": "表面分析（描述表面特徵、氧化、包漿等）",
    "patternAnalysis": "紋飾分析（描述圖案、風格、時代特徵）",
    "materialComposition": "材質分析（描述材質特徵及判斷依據）",
    "historicalContext": "歷史背景（該類文物的歷史價值及地位）",
    "provenanceNotes": "來源記錄建議",
    "conservationSuggestions": "保存建議",
    "comparableItems": ["可比較品1", "可比較品2"],
    "riskFactors": ["風險因素1", "風險因素2"]
  }
}

重要規則：
1. overallScore 為 0-100 的整數
2. 如果照片中不是文物/古董，仍然分析該物品但在authenticity中說明
3. 如果照片不清楚，在報告中說明並基於可見特徵分析
4. 估價要合理，參考國際拍賣市場行情
5. 必須只回覆JSON，不要加任何markdown標記或其他文字`;

// Detect which AI provider is configured
function getAIConfig(): { apiKey: string; baseURL: string; model: string; provider: string } {
  // DeepSeek (priority if set)
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
      model: "deepseek-chat",
      provider: "DeepSeek",
    };
  }

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.openai.com/v1",
      model: "gpt-4o",
      provider: "OpenAI GPT-4o",
    };
  }

  throw new Error("NO_API_KEY");
}

export function getAIProvider(): { enabled: boolean; provider: string } {
  if (process.env.DEEPSEEK_API_KEY) {
    return { enabled: true, provider: "DeepSeek" };
  }
  if (process.env.OPENAI_API_KEY) {
    return { enabled: true, provider: "OpenAI GPT-4o" };
  }
  return { enabled: false, provider: "未配置" };
}

export async function analyzeWithAI(
  images: string[]
): Promise<AIAnalysisResult> {
  const config = getAIConfig();

  const openai = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  // Build the message content with all images
  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    {
      type: "text",
      text: `請分析以下 ${images.length} 張文物照片，提供專業的鑑定報告。請仔細觀察每張照片中的所有細節。`,
    },
  ];

  const angleLabels = ["正面/主視角", "背面/底部", "細節特寫"];

  for (let i = 0; i < images.length; i++) {
    content.push({
      type: "text",
      text: `\n--- 第 ${i + 1} 張照片（${angleLabels[i] || `角度${i + 1}`}）---`,
    });
    content.push({
      type: "image_url",
      image_url: {
        url: images[i],
        detail: "high",
      },
    });
  }

  console.log(`Using AI provider: ${config.provider}, model: ${config.model}`);

  const response = await openai.chat.completions.create({
    model: config.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content },
    ],
    max_tokens: 4000,
    temperature: 0.3,
  });

  const text = response.choices[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("AI_EMPTY_RESPONSE");
  }

  // Parse JSON - handle possible markdown code blocks
  let jsonStr = text;
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  try {
    const result = JSON.parse(jsonStr) as AIAnalysisResult;

    // Validate required fields
    if (!result.title || !result.analysisReport) {
      throw new Error("Missing required fields");
    }

    // Ensure overallScore is a number between 0-100
    result.overallScore = Math.max(0, Math.min(100, Math.round(Number(result.overallScore) || 50)));

    return result;
  } catch (parseError) {
    console.error("Failed to parse AI response:", text.substring(0, 500));
    throw new Error("AI_PARSE_ERROR");
  }
}
