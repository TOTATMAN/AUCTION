"use client";

import { useState } from "react";
import HomeScreen from "@/components/HomeScreen";
import CameraScreen from "@/components/CameraScreen";
import AnalyzingScreen from "@/components/AnalyzingScreen";
import ReportScreen from "@/components/ReportScreen";
import ReportsListScreen from "@/components/ReportsListScreen";
import ReportDetailScreen from "@/components/ReportDetailScreen";

export type Screen =
  | "home"
  | "camera"
  | "analyzing"
  | "report"
  | "reports-list"
  | "report-detail";

export interface ReportData {
  id: string;
  title: string;
  category: string | null;
  dynasty: string | null;
  material: string | null;
  estimatedAge: string | null;
  estimatedValue: string | null;
  condition: string | null;
  authenticity: string | null;
  overallScore: number | null;
  analysisReport: string;
  detailedFindings: Record<string, unknown> | null;
  images: string[];
  createdAt: string;
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const handleStartCapture = () => {
    setCapturedImages([]);
    setScreen("camera");
  };

  const handleImagesReady = (images: string[]) => {
    setCapturedImages(images);
    setScreen("analyzing");
  };

  const handleAnalysisComplete = (report: ReportData) => {
    setCurrentReport(report);
    setScreen("report");
  };

  const handleViewReport = (report: ReportData) => {
    setCurrentReport(report);
    setScreen("report-detail");
  };

  const handleBack = () => {
    setScreen("home");
  };

  return (
    <div className="min-h-screen relative">
      {screen === "home" && (
        <HomeScreen
          onStartCapture={handleStartCapture}
          onViewReports={() => setScreen("reports-list")}
        />
      )}
      {screen === "camera" && (
        <CameraScreen
          onImagesReady={handleImagesReady}
          onBack={handleBack}
        />
      )}
      {screen === "analyzing" && (
        <AnalyzingScreen
          images={capturedImages}
          onComplete={handleAnalysisComplete}
          onError={handleBack}
        />
      )}
      {screen === "report" && currentReport && (
        <ReportScreen report={currentReport} onBack={handleBack} />
      )}
      {screen === "reports-list" && (
        <ReportsListScreen
          onViewReport={handleViewReport}
          onBack={handleBack}
        />
      )}
      {screen === "report-detail" && currentReport && (
        <ReportDetailScreen report={currentReport} onBack={() => setScreen("reports-list")} />
      )}
    </div>
  );
}
