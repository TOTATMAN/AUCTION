import { db } from "@/db";
import { appraisalReports } from "@/db/schema";
import { analyzeWithAI, getAIProvider } from "@/lib/ai-analyzer";
import { analyzeAntique } from "@/lib/antique-analyzer";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "無法解析請求數據，照片可能太大" },
        { status: 400 }
      );
    }

    const { images } = body as { images: string[] };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return Response.json(
        { error: "請至少上傳一張照片進行鑑定" },
        { status: 400 }
      );
    }

    if (images.length > 3) {
      return Response.json(
        { error: "最多只能上傳三張照片" },
        { status: 400 }
      );
    }

    let analysis;
    const aiInfo = getAIProvider();

    // Try real AI analysis first
    if (aiInfo.enabled) {
      try {
        console.log(`Starting AI analysis with ${aiInfo.provider}...`);
        analysis = await analyzeWithAI(images);
        console.log("AI analysis completed successfully");
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
        const errMsg = aiError instanceof Error ? aiError.message : "Unknown error";
        return Response.json(
          { error: `AI分析失敗 (${aiInfo.provider}): ${errMsg}。請檢查API金鑰是否正確。` },
          { status: 500 }
        );
      }
    } else {
      // No API key, use simulation
      console.log("No API key set, using simulated analysis");
      analysis = analyzeAntique(images.length);
    }

    // Truncate images if too large for DB storage
    const storedImages = images.map((img) => {
      if (img.length > 500000) {
        return img.substring(0, 500000);
      }
      return img;
    });

    // Save to database
    const [report] = await db
      .insert(appraisalReports)
      .values({
        title: analysis.title,
        category: analysis.category,
        dynasty: analysis.dynasty,
        material: analysis.material,
        estimatedAge: analysis.estimatedAge,
        estimatedValue: analysis.estimatedValue,
        condition: analysis.condition,
        authenticity: analysis.authenticity,
        overallScore: analysis.overallScore,
        analysisReport: analysis.analysisReport,
        detailedFindings: analysis.detailedFindings,
        images: storedImages,
      })
      .returning();

    return Response.json({ success: true, report, provider: aiInfo.provider });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "未知錯誤";
    return Response.json(
      { error: `分析過程中發生錯誤: ${message}` },
      { status: 500 }
    );
  }
}
