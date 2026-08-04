"use client";

import { useState } from "react";
import type { ReportData } from "@/app/page";

interface ReportDetailScreenProps {
  report: ReportData;
  onBack: () => void;
}

interface DetailedFindings {
  surfaceAnalysis?: string;
  patternAnalysis?: string;
  materialComposition?: string;
  historicalContext?: string;
  provenanceNotes?: string;
  conservationSuggestions?: string;
  comparableItems?: string[];
  riskFactors?: string[];
}

export default function ReportDetailScreen({ report, onBack }: ReportDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "details" | "photos">("summary");
  const findings = report.detailedFindings as DetailedFindings | null;

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-steel-400";
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-accent-400";
    return "text-orange-400";
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return "待評估";
    if (score >= 90) return "極佳";
    if (score >= 80) return "優良";
    if (score >= 70) return "良好";
    return "一般";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-steel-950 to-steel-900">
      {/* Header */}
      <header className="safe-top bg-gradient-to-b from-navy-900/60 to-transparent px-4 pt-6 pb-4">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-steel-800/80 flex items-center justify-center text-accent-400"
          >
            ←
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-silver-100">
            鑑定報告詳情
          </h1>
          <div className="w-10" />
        </div>

        {/* Score Badge */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-steel-800" />
              <circle
                cx="50" cy="50" r="42" fill="none" strokeWidth="6"
                strokeDasharray={`${(report.overallScore || 0) * 2.64} 264`}
                strokeLinecap="round"
                className={getScoreColor(report.overallScore)}
                stroke="currentColor"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(report.overallScore)}`}>
                {report.overallScore || "—"}
              </span>
              <span className="text-xs text-steel-400">{getScoreLabel(report.overallScore)}</span>
            </div>
          </div>
        </div>

        <h2 className="text-center text-xl font-bold text-silver-100 mb-1">
          {report.title}
        </h2>
        <p className="text-center text-sm text-steel-400">
          {report.dynasty} · {report.category}
        </p>
      </header>

      {/* Tabs */}
      <div className="flex px-4 gap-1 mb-4">
        {(["summary", "details", "photos"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-accent-600/20 text-accent-300 border border-accent-500/40"
                : "bg-steel-800/30 text-steel-400 border border-transparent"
            }`}
          >
            {tab === "summary" ? "📊 概要" : tab === "details" ? "🔍 詳情" : "📷 照片"}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 px-4 pb-4 overflow-auto">
        {activeTab === "summary" && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-3">
              <InfoCard icon="🏛️" label="年代" value={report.dynasty || "待考證"} />
              <InfoCard icon="📦" label="材質" value={report.material || "待分析"} />
              <InfoCard icon="⏳" label="估計年齡" value={report.estimatedAge || "待考證"} />
              <InfoCard icon="💰" label="估價" value={report.estimatedValue || "待評估"} />
            </div>

            <div className="bg-steel-800/40 rounded-2xl p-4 border border-steel-700/30">
              <div className="flex items-center gap-2 mb-2">
                <span>📋</span>
                <span className="text-sm font-medium text-accent-300">品相狀況</span>
              </div>
              <p className="text-sm text-steel-200">{report.condition || "待評估"}</p>
            </div>

            <div className="bg-steel-800/40 rounded-2xl p-4 border border-steel-700/30">
              <div className="flex items-center gap-2 mb-2">
                <span>✅</span>
                <span className="text-sm font-medium text-accent-300">真偽判斷</span>
              </div>
              <p className="text-sm text-steel-200">{report.authenticity || "待鑑定"}</p>
            </div>

            <div className="bg-steel-800/40 rounded-2xl p-4 border border-steel-700/30">
              <div className="flex items-center gap-2 mb-3">
                <span>📝</span>
                <span className="text-sm font-medium text-accent-300">完整鑑定報告</span>
              </div>
              <pre className="text-xs text-steel-200 whitespace-pre-wrap leading-relaxed font-sans">
                {report.analysisReport}
              </pre>
            </div>
          </div>
        )}

        {activeTab === "details" && findings && (
          <div className="space-y-3 animate-fade-in-up">
            <DetailSection icon="🔬" title="表面分析" content={findings.surfaceAnalysis} />
            <DetailSection icon="🎨" title="紋飾分析" content={findings.patternAnalysis} />
            <DetailSection icon="⚗️" title="材質成分" content={findings.materialComposition} />
            <DetailSection icon="📚" title="歷史背景" content={findings.historicalContext} />
            <DetailSection icon="🔖" title="來源記錄" content={findings.provenanceNotes} />
            <DetailSection icon="🛡️" title="保存建議" content={findings.conservationSuggestions} />

            {findings.comparableItems && findings.comparableItems.length > 0 && (
              <div className="bg-steel-800/40 rounded-2xl p-4 border border-steel-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <span>📎</span>
                  <span className="text-sm font-medium text-accent-300">可比較品</span>
                </div>
                <ul className="space-y-2">
                  {findings.comparableItems.map((item, i) => (
                    <li key={i} className="text-xs text-steel-300 flex items-start gap-2">
                      <span className="text-accent-500 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {findings.riskFactors && findings.riskFactors.length > 0 && (
              <div className="bg-orange-950/20 rounded-2xl p-4 border border-orange-700/30">
                <div className="flex items-center gap-2 mb-3">
                  <span>⚠️</span>
                  <span className="text-sm font-medium text-orange-400">風險提示</span>
                </div>
                <ul className="space-y-2">
                  {findings.riskFactors.map((factor, i) => (
                    <li key={i} className="text-xs text-steel-300 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="space-y-4 animate-fade-in-up">
            {(report.images as string[]).map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-navy-600/30">
                <img
                  src={img}
                  alt={`藏品照片 ${i + 1}`}
                  className="w-full object-contain bg-steel-800"
                />
                <div className="px-4 py-2 bg-steel-800/60">
                  <span className="text-xs text-steel-400">照片 {i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action */}
      <footer className="safe-bottom px-4 py-4 border-t border-steel-800">
        <button
          onClick={onBack}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-400 text-white font-bold text-base tracking-wider shadow-lg shadow-accent-500/30 active:scale-95 transition-transform"
        >
          返回列表
        </button>
      </footer>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-steel-800/40 rounded-2xl p-3.5 border border-steel-700/30">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-steel-400">{label}</span>
      </div>
      <p className="text-sm font-medium text-steel-100 leading-snug">{value}</p>
    </div>
  );
}

function DetailSection({ icon, title, content }: { icon: string; title: string; content?: string }) {
  if (!content) return null;
  return (
    <div className="bg-steel-800/40 rounded-2xl p-4 border border-steel-700/30">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-sm font-medium text-accent-300">{title}</span>
      </div>
      <p className="text-sm text-steel-200 leading-relaxed">{content}</p>
    </div>
  );
}
