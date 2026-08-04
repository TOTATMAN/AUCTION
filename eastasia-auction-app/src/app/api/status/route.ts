import { getAIProvider } from "@/lib/ai-analyzer";

export const dynamic = "force-dynamic";

export async function GET() {
  const info = getAIProvider();

  return Response.json({
    aiEnabled: info.enabled,
    provider: info.provider,
    message: info.enabled
      ? `AI鑑定系統已啟用（${info.provider}）`
      : "AI鑑定系統未啟用 — 請設定 DEEPSEEK_API_KEY 或 OPENAI_API_KEY",
  });
}
