import { db } from "@/db";
import { appraisalReports } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reports = await db
      .select({
        id: appraisalReports.id,
        title: appraisalReports.title,
        category: appraisalReports.category,
        dynasty: appraisalReports.dynasty,
        estimatedValue: appraisalReports.estimatedValue,
        overallScore: appraisalReports.overallScore,
        authenticity: appraisalReports.authenticity,
        createdAt: appraisalReports.createdAt,
      })
      .from(appraisalReports)
      .orderBy(desc(appraisalReports.createdAt))
      .limit(50);

    return Response.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return Response.json({ error: "無法獲取報告列表" }, { status: 500 });
  }
}
