"use client";

import { useEffect, useState } from "react";

interface HomeScreenProps {
  onStartCapture: () => void;
  onViewReports: () => void;
}

export default function HomeScreen({ onStartCapture, onViewReports }: HomeScreenProps) {
  const [aiStatus, setAiStatus] = useState<{ aiEnabled: boolean; message: string; provider?: string } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data) => setAiStatus(data))
      .catch(() => setAiStatus(null));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-steel-950 via-navy-900 to-steel-950">
      {/* Header */}
      <header className="safe-top pt-8 pb-4 px-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent-500 to-navy-600 shadow-lg shadow-accent-500/20 mb-4">
          <span className="text-4xl">🏺</span>
        </div>
        <h1 className="text-2xl font-bold text-silver-100 tracking-wider">
          東亞拍賣有限公司
        </h1>
        <p className="text-sm text-silver-400/70 mt-1 tracking-widest">
          EAST ASIA AUCTION CO., LTD.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
        {/* Hero Section */}
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="relative bg-gradient-to-br from-steel-900/80 to-steel-950/80 backdrop-blur-sm rounded-3xl border border-navy-600/30 p-8 text-center shadow-2xl">
            {/* Decorative corner elements */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-accent-500/40 rounded-tl-lg" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent-500/40 rounded-tr-lg" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent-500/40 rounded-bl-lg" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-accent-500/40 rounded-br-lg" />

            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-silver-100 mb-2">
              AI智能文物鑑定
            </h2>
            <p className="text-steel-300 text-sm leading-relaxed mb-4">
              運用人工智能技術，為您的中國文物藏品提供專業的初步鑑定分析報告
            </p>

            {/* AI Status Badge */}
            {aiStatus && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-5 ${
                aiStatus.aiEnabled
                  ? "bg-green-900/30 text-green-400 border border-green-700/30"
                  : "bg-orange-900/30 text-orange-400 border border-orange-700/30"
              }`}>
                <span className={`w-2 h-2 rounded-full ${aiStatus.aiEnabled ? "bg-green-400" : "bg-orange-400"}`} />
                {aiStatus.aiEnabled ? `${aiStatus.provider || "AI"} 已啟用` : "AI未配置 — 使用模擬分析"}
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-navy-700/50 flex items-center justify-center mb-2">
                  <span className="text-2xl">📸</span>
                </div>
                <span className="text-xs text-steel-400">拍照上傳</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-navy-700/50 flex items-center justify-center mb-2">
                  <span className="text-2xl">🤖</span>
                </div>
                <span className="text-xs text-steel-400">AI分析</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-navy-700/50 flex items-center justify-center mb-2">
                  <span className="text-2xl">📋</span>
                </div>
                <span className="text-xs text-steel-400">鑑定報告</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={onStartCapture}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-400 text-white font-bold text-lg tracking-wider shadow-lg shadow-accent-500/30 active:scale-95 transition-transform"
            >
              開始鑑定
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="safe-bottom pb-4 px-6">
        <button
          onClick={onViewReports}
          className="w-full py-3.5 rounded-2xl bg-steel-800/60 border border-steel-700/50 text-silver-300 font-medium text-center active:bg-steel-700/60 transition-colors"
        >
          📑 查看歷史鑑定報告
        </button>
        <p className="text-center text-xs text-steel-600 mt-3">
          © 東亞拍賣有限公司 · 專業文物鑑定
        </p>
      </footer>
    </div>
  );
}
