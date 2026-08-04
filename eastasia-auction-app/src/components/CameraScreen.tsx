"use client";

import { useState, useRef, useCallback } from "react";

interface CameraScreenProps {
  onImagesReady: (images: string[]) => void;
  onBack: () => void;
}

export default function CameraScreen({ onImagesReady, onBack }: CameraScreenProps) {
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSlot = useRef<number>(0);

  const MAX_IMAGES = 3;

  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 800;
          let { width, height } = img;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Cannot get canvas context"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const compressed = await compressImage(file);
        setImages((prev) => {
          const next = [...prev];
          next[currentSlot.current] = compressed;
          return next;
        });
      } catch (err) {
        console.error("Image processing error:", err);
        alert("照片處理失敗，請重試");
      }

      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [compressImage]
  );

  const triggerCapture = (slot: number) => {
    currentSlot.current = slot;
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      alert("請至少拍攝一張照片");
      return;
    }
    onImagesReady(images.filter(Boolean));
  };

  const labels = ["正面照", "背面/底部", "細節特寫"];
  const icons = ["📷", "🔄", "🔎"];

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
          拍攝藏品照片
        </h1>
        <div className="w-10" />
      </header>

      {/* Instructions */}
      <div className="px-6 pb-4">
        <div className="bg-navy-800/40 rounded-2xl p-4 border border-navy-600/20">
          <p className="text-sm text-steel-300 leading-relaxed">
            📌 請拍攝藏品的<span className="text-accent-300 font-medium">三個角度</span>的照片，以獲得更準確的鑑定結果。確保光線充足、畫面清晰。
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Slots */}
      <main className="flex-1 px-6 space-y-4">
        {Array.from({ length: MAX_IMAGES }).map((_, index) => (
          <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            {images[index] ? (
              /* Image Preview */
              <div className="relative rounded-2xl overflow-hidden border-2 border-accent-500/40 shadow-lg">
                <img
                  src={images[index]}
                  alt={`藏品照片 ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs text-silver-200 font-medium">
                    {icons[index]} {labels[index]}
                  </span>
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-700/80 backdrop-blur-sm flex items-center justify-center text-white text-sm"
                >
                  ✕
                </button>
                <button
                  onClick={() => triggerCapture(index)}
                  className="absolute bottom-3 right-3 bg-accent-500/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-white font-medium"
                >
                  重新拍攝
                </button>
              </div>
            ) : (
              /* Empty Slot */
              <button
                onClick={() => triggerCapture(index)}
                className="w-full h-48 rounded-2xl border-2 border-dashed border-steel-600 bg-steel-800/30 flex flex-col items-center justify-center gap-3 active:bg-steel-700/40 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-navy-700/50 flex items-center justify-center">
                  <span className="text-3xl">{icons[index]}</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-steel-300">
                    {labels[index]}
                  </p>
                  <p className="text-xs text-steel-500 mt-0.5">
                    點擊拍攝或選擇照片
                  </p>
                </div>
              </button>
            )}
          </div>
        ))}
      </main>

      {/* Bottom Action */}
      <footer className="safe-bottom px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-steel-400">
            已拍攝 {images.filter(Boolean).length}/{MAX_IMAGES} 張
          </span>
          <span className="text-xs text-steel-500">
            至少需要1張照片
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={images.filter(Boolean).length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-400 text-white font-bold text-lg tracking-wider shadow-lg shadow-accent-500/30 disabled:opacity-40 disabled:shadow-none active:scale-95 transition-all"
        >
          🔍 開始AI鑑定分析
        </button>
      </footer>
    </div>
  );
}
