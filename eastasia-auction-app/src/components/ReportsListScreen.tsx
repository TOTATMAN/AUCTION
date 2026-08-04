"use client";

import { useEffect, useState } from "react";
import type { ReportData } from "@/app/page";

interface ReportsListScreenProps {
  onViewReport: (report: ReportData) => void;
  onBack: () => void;
}

interface ReportListItem {
  id: string;
  title: string;
  category: string | null;
  dynasty: string | null;
  estimatedValue: string | null;
  overallScore: number | null;
  authenticity: string | null;
  createdAt: string;
}

export default function ReportsListScreen({ onViewReport, onBack }: ReportsListScreenProps) {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reports");
      if (!response.ok) throw new Error("載入失敗");
      const data = await response.json();
      setReports(data.reports);
    } catch {
      setError("無法載入報告列表");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`);
      if (!response.ok) throw new Error("載入失敗");
      const data = await response.json();
      onViewReport(data.report as ReportData);
    } catch {
      alert("無法載入報告詳情");
    }
  };

  const handleDeleteReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("確定要刪除此鑑定報告嗎？")) return;

    try {
      const response = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("刪除失敗");
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("刪除失敗，請重試");
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-steel-700 text-steel-400";
    if (score >= 85) return "bg-green-900/40 text-green-400";
    if (score >= 70) return "bg-accent-900/40 text-accent-300";
    return "bg-orange-900/40 text-orange-400";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-steel-950 to-steel-900">
      {/* Header */}
      <header className="safe-top flex items-center px-4 pt-6 pb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-steel-800/80 flex items-center justify-center text-accent-400"
        >
          ←
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-silver-100">
          歷史鑑定報告
        </h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-navy-700/30 border-t-accent-400 rounded-full animate-spin mb-4" />
            <p className="text-sm text-steel-400">載入中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-4xl mb-4">❌</span>
            <p className="text-sm text-steel-400">{error}</p>
            <button
              onClick={fetchReports}
              className="mt-4 px-6 py-2 rounded-xl bg-accent-600/20 text-accent-300 text-sm"
            >
              重試
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-5xl mb-4">📋</span>
            <p className="text-base text-steel-300 mb-2">暫無鑑定報告</p>
            <p className="text-sm text-steel-500">開始拍攝藏品進行鑑定吧</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-steel-500 px-1 mb-2">
              共 {reports.length} 份報告
            </p>
            {reports.map((report, i) => (
              <button
                key={report.id}
                onClick={() => handleViewReport(report.id)}
                className="w-full text-left bg-steel-800/40 rounded-2xl p-4 border border-steel-700/30 active:bg-steel-700/40 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-silver-100 truncate">
                      {report.title}
                    </h3>
                    <p className="text-xs text-steel-400 mt-1">
                      {report.dynasty} · {report.category}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getScoreColor(report.overallScore)}`}>
                        {report.overallScore ? `${report.overallScore}分` : "待評"}
                      </span>
                      <span className="text-xs text-steel-500">
                        {report.estimatedValue}
                      </span>
                    </div>
                    <p className="text-xs text-steel-600 mt-2">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteReport(report.id, e)}
                      className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center text-red-400 text-xs hover:bg-red-800/40"
                    >
                      🗑️
                    </button>
                    <span className="text-steel-600 text-lg">›</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
