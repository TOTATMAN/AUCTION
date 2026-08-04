"use client";

import { useEffect, useState, useRef } from "react";
import type { ReportData } from "@/app/page";

interface AnalyzingScreenProps {
  images: string[];
  onComplete: (report: ReportData) => void;
  onError: () => void;
}

const analysisSteps = [
  { icon: "📸", text: "載入影像數據..." },
  { icon: "🔬", text: "分析材質紋理..." },
  { icon: "🎨", text: "辨識紋飾風格..." },
  { icon: "📐", text: "測量器形比例..." },
  { icon: "🏛️", text: "比對歷史資料庫..." },
  { icon: "📊", text: "生成鑑定報告..." },
];

export default function AnalyzingScreen({
  images,
  onComplete,
  onError,
}: AnalyzingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    // Animate progress steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < analysisSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.random() * 8 + 2;
      });
    }, 200);

    // Call API
    const analyze = async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "分析失敗");
        }

        const data = await response.json();

        // Wait for animation to finish
        await new Promise((resolve) => setTimeout(resolve, 1500));

        clearInterval(stepInterval);
        clearInterval(progressInterval);
        setProgress(100);
        setCurrentStep(analysisSteps.length - 1);

        await new Promise((resolve) => setTimeout(resolve, 500));

        onComplete(data.report as ReportData);
      } catch (err) {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
        console.error(err);
        const errorMsg = err instanceof Error ? err.message : "未知錯誤";
        alert(`分析過程中發生錯誤: ${errorMsg}\n\n請檢查網絡連接後重試。`);
        onError();
      }
    };

    analyze();

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [images, onComplete, onError]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-steel-950 via-navy-900/30 to-steel-950 px-6">
      {/* Analyzing Animation */}
      <div className="relative mb-10">
        {/* Outer ring */}
        <div className="w-32 h-32 rounded-full border-4 border-navy-700/30 flex items-center justify-center animate-pulse-ring">
          <div className="w-24 h-24 rounded-full border-2 border-accent-500/40 flex items-center justify-center">
            <span className="text-5xl">{analysisSteps[currentStep]?.icon}</span>
          </div>
        </div>
        {/* Spinning ring */}
        <div className="absolute inset-0 w-32 h-32 rounded-full border-t-4 border-accent-400 animate-spin" style={{ animationDuration: "2s" }} />
      </div>

      {/* Status Text */}
      <h2 className="text-xl font-bold text-silver-100 mb-2">AI鑑定分析中</h2>
      <p className="text-sm text-steel-400 mb-8 animate-fade-in-up">
        {analysisSteps[currentStep]?.text}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-steel-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-steel-500 text-center">
          {Math.min(Math.round(progress), 100)}%
        </p>
      </div>

      {/* Steps List */}
      <div className="mt-8 w-full max-w-xs space-y-2">
        {analysisSteps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
              i <= currentStep
                ? "bg-navy-800/40 text-silver-200"
                : "text-steel-600"
            }`}
          >
            <span className="text-lg">{i < currentStep ? "✅" : step.icon}</span>
            <span className="text-sm">{step.text}</span>
          </div>
        ))}
      </div>

      {/* Thumbnail preview */}
      <div className="mt-8 flex gap-2">
        {images.map((img, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-xl overflow-hidden border border-navy-600/30 opacity-60"
          >
            <img
              src={img}
              alt={`照片 ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
