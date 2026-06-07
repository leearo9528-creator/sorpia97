"use client";

import { useState, useEffect } from "react";
import { X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [hidden, setHidden] = useState(true); // 기본 hidden, 조건 맞을 때만 표시

  useEffect(() => {
    // 이미 설치된 경우 숨김
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());

    if (iOS) {
      setIsIOS(true);
      setHidden(false);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (hidden) return null;

  async function handleClick() {
    if (isIOS) {
      setShowGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setHidden(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand)] text-[var(--brand-strong)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--brand-soft)] transition-colors"
      >
        <Smartphone className="w-3.5 h-3.5" />
        앱 설치
      </button>

      {showGuide && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowGuide(false)}
          />

          {/* 바텀 시트 */}
          <div
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl"
            style={{ backgroundColor: "#ffffff" }}
          >
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
            </div>

            <div className="px-6 pt-3 pb-8">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white"
                    style={{ backgroundColor: "#3a7a3f" }}>
                    S
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">소르피아97</p>
                    <p className="text-xs text-gray-400">홈 화면에 추가하기</p>
                  </div>
                </div>
                <button onClick={() => setShowGuide(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: "#f3f4f6" }}>
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* 단계 안내 */}
              <div className="space-y-4 mb-7">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: "#3a7a3f" }}>
                    1
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-medium text-gray-800">하단 공유 버튼 탭</p>
                    <p className="text-xs text-gray-400 mt-0.5">Safari 아래 가운데 □↑ 아이콘</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: "#3a7a3f" }}>
                    2
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-medium text-gray-800">"홈 화면에 추가" 선택</p>
                    <p className="text-xs text-gray-400 mt-0.5">메뉴를 아래로 스크롤하면 보여요</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: "#3a7a3f" }}>
                    3
                  </div>
                  <div className="pt-0.5">
                    <p className="text-sm font-medium text-gray-800">오른쪽 상단 "추가" 탭</p>
                    <p className="text-xs text-gray-400 mt-0.5">홈 화면에 아이콘이 생겨요</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm"
                style={{ backgroundColor: "#3a7a3f" }}
              >
                확인했어요
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
