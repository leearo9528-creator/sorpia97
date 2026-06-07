"use client";

import { useState, useEffect } from "react";
import { Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // 이미 설치된 경우 숨김
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setHidden(true);
      return;
    }

    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (hidden) return null;
  if (!prompt && !isIOS) return null;

  async function handleInstall() {
    if (isIOS) {
      setShowGuide(true);
      return;
    }
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setHidden(true);
  }

  return (
    <>
      <button
        onClick={handleInstall}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--brand)] text-[var(--brand-strong)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--brand-soft)] transition-colors"
      >
        <Share className="w-3.5 h-3.5" />
        앱 설치
      </button>

      {/* iOS 안내 시트 */}
      {showGuide && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setShowGuide(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl p-6 shadow-2xl" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-[var(--brand-strong)]">홈 화면에 추가</h3>
              <button onClick={() => setShowGuide(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ol className="space-y-4 text-sm text-[var(--foreground-soft)]">
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] flex items-center justify-center font-bold text-xs">1</span>
                <span>Safari 하단의 <strong>공유</strong> 버튼(<Share className="inline w-4 h-4" />)을 탭하세요</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] flex items-center justify-center font-bold text-xs">2</span>
                <span>스크롤해서 <strong>홈 화면에 추가</strong>를 선택하세요</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] flex items-center justify-center font-bold text-xs">3</span>
                <span>오른쪽 상단의 <strong>추가</strong>를 탭하면 완료!</span>
              </li>
            </ol>
            <button onClick={() => setShowGuide(false)} className="mt-6 w-full btn-primary">확인</button>
          </div>
        </>
      )}
    </>
  );
}
