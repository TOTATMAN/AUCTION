import { db } from "@/db";
import { appraisalReports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [report] = await db
      .select()
      .from(appraisalReports)
      .where(eq(appraisalReports.id, id))
      .limit(1);

    if (!report) {
      return Response.json({ error: "報告不存在" }, { status: 404 });
    }

    return Response.json({ report });
  } catch (error) {
    console.error("Error fetching report:", error);
    return Response.json({ error: "無法獲取報告" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db
      .delete(appraisalReports)
      .where(eq(appraisalReports.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return Response.json({ error: "無法刪除報告" }, { status: 500 });
  }
}
