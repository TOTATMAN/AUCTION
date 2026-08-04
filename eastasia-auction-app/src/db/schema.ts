import { pgTable, text, timestamp, uuid, jsonb, integer } from "drizzle-orm/pg-core";

export const appraisalReports = pgTable("appraisal_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  category: text("category"),
  dynasty: text("dynasty"),
  material: text("material"),
  estimatedAge: text("estimated_age"),
  estimatedValue: text("estimated_value"),
  condition: text("condition"),
  authenticity: text("authenticity"),
  overallScore: integer("overall_score"),
  analysisReport: text("analysis_report").notNull(),
  detailedFindings: jsonb("detailed_findings"),
  images: jsonb("images").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AppraisalReport = typeof appraisalReports.$inferSelect;
export type NewAppraisalReport = typeof appraisalReports.$inferInsert;
