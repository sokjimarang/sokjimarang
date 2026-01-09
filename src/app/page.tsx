"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Vapi from "@vapi-ai/web";

type CallStatus = "idle" | "connecting" | "active" | "ended";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Home() {
  const vapiRef = useRef<Vapi | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicKey = useMemo(
    () => process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? null,
    []
  );

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    const vapiInstance = new Vapi(publicKey);
    vapiRef.current = vapiInstance;

    vapiInstance.on("call-start", () => {
      setStatus("active");
      setError(null);
    });

    vapiInstance.on("call-end", () => {
      setStatus("ended");
      setIsSpeaking(false);
    });

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript") {
        const transcript = message as {
          role: "user" | "assistant";
          transcript: string;
          transcriptType: string;
        };

        if (transcript.transcriptType === "final") {
          setMessages((prev) => [
            ...prev,
            {
              role: transcript.role,
              content: transcript.transcript,
              timestamp: new Date(),
            },
          ]);
        }
      }
    });

    vapiInstance.on("error", (err) => {
      console.error("Vapi error:", err);
      setError("통화 중 오류가 발생했습니다.");
      setStatus("idle");
    });

    requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      vapiInstance.stop();
      vapiRef.current = null;
    };
  }, [publicKey]);

  const startCall = useCallback(async () => {
    const vapi = vapiRef.current;
    if (!vapi) return;

    setStatus("connecting");
    setMessages([]);
    setError(null);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

      await vapi.start({
        name: "속지마랑 - 보이스피싱 시뮬레이터",
        model: {
          provider: "custom-llm",
          url: `${baseUrl}/api/custom-llm`,
          model: "gemini-2.0-flash",
        },
        voice: {
          provider: "11labs",
          voiceId: "nPczCjzI2devNBz1zQrb", // Brian (남성, 권위있는 톤)
          model: "eleven_flash_v2_5",
          speed: 1.2,
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "ko",
        },
        firstMessage:
          "여보세요, 금융감독원 금융사기대응팀 김철수 조사관입니다. 본인 확인을 위해 몇 가지 질문을 드려도 될까요?",
      });
    } catch (err) {
      console.error("Failed to start call:", err);
      setError("통화를 시작할 수 없습니다. 마이크 권한을 확인해주세요.");
      setStatus("idle");
    }
  }, []);

  const endCall = useCallback(() => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    vapi.stop();
    setStatus("ended");
  }, []);

  const isApiKeyMissing = !publicKey;
  const canStart = isReady && !isApiKeyMissing;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          🛡️ 속지마랑 - 보이스피싱 예방 훈련
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          AI 음성 시뮬레이션으로 보이스피싱 대응력을 키우세요
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        {isApiKeyMissing && (
          <div className="w-full max-w-md rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            ⚠️ NEXT_PUBLIC_VAPI_PUBLIC_KEY가 설정되지 않았습니다.
          </div>
        )}

        {error && (
          <div className="w-full max-w-md rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-32 w-32 items-center justify-center rounded-full transition-all ${
              status === "active"
                ? isSpeaking
                  ? "animate-pulse bg-green-500"
                  : "bg-green-400"
                : status === "connecting"
                  ? "animate-pulse bg-yellow-400"
                  : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            <span className="text-5xl">
              {status === "active" ? "🎤" : status === "connecting" ? "📞" : "🔇"}
            </span>
          </div>

          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            {status === "idle" && "대기 중"}
            {status === "connecting" && "연결 중..."}
            {status === "active" && (isSpeaking ? "AI 발화 중..." : "듣는 중...")}
            {status === "ended" && "통화 종료"}
          </p>
        </div>

        <div className="flex gap-4">
          {status === "idle" || status === "ended" ? (
            <button
              onClick={startCall}
              disabled={!canStart}
              className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              훈련 시작
            </button>
          ) : (
            <button
              onClick={endCall}
              className="rounded-full bg-red-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-red-700"
            >
              통화 종료
            </button>
          )}
        </div>

        {messages.length > 0 && (
          <div className="mt-6 w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              대화 기록
            </h2>
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 ${
                    msg.role === "assistant"
                      ? "bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                  }`}
                >
                  <span className="text-xs font-medium uppercase opacity-60">
                    {msg.role === "assistant" ? "AI (사기범)" : "나"}
                  </span>
                  <p className="mt-1">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === "ended" && messages.length > 0 && (
          <div className="mt-4 w-full max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200">
              💡 디브리핑
            </h3>
            <p className="mt-2 text-amber-800 dark:text-amber-300">
              이것은 보이스피싱 예방 훈련이었습니다. 실제 상황에서는:
            </p>
            <ul className="mt-2 list-inside list-disc text-amber-700 dark:text-amber-400">
              <li>금융감독원은 전화로 개인정보를 요구하지 않습니다</li>
              <li>의심되면 즉시 전화를 끊고 공식 번호로 확인하세요</li>
              <li>절대 계좌 정보나 비밀번호를 알려주지 마세요</li>
            </ul>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-4 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        속지마랑 PoC v0.1 | Voice AI 기반 보이스피싱 예방 교육 서비스
      </footer>
    </div>
  );
}
