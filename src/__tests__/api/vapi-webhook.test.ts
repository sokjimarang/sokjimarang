import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/vapi/webhook/route";
import { NextRequest } from "next/server";

function createMockRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/vapi/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/vapi/webhook", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("이벤트 타입별 처리", () => {
    it("status-update 이벤트를 처리해야 함", async () => {
      const request = createMockRequest({
        message: {
          type: "status-update",
          status: "in-progress",
          call: { id: "call-123", status: "active" },
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("📊 Call status:", "in-progress");
    });

    it("end-of-call-report 이벤트를 처리해야 함", async () => {
      const request = createMockRequest({
        message: {
          type: "end-of-call-report",
          endedReason: "user-hangup",
          transcript: "테스트 대화 내용",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("📋 Call ended:", "user-hangup");
      expect(consoleSpy).toHaveBeenCalledWith("📝 Transcript:", "테스트 대화 내용");
    });

    it("transcript 이벤트를 처리해야 함", async () => {
      const request = createMockRequest({
        message: {
          type: "transcript",
          transcript: "실시간 텍스트",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("🎤 Live transcript:", "실시간 텍스트");
    });

    it("assistant-request 이벤트를 처리해야 함", async () => {
      const request = createMockRequest({
        message: {
          type: "assistant-request",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("🤖 Assistant request received");
    });

    it("알 수 없는 이벤트 타입도 처리해야 함", async () => {
      const request = createMockRequest({
        message: {
          type: "unknown-event-type",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("❓ Unknown event type:", "unknown-event-type");
    });
  });

  describe("에러 처리", () => {
    it("잘못된 JSON에 대해 500 에러를 반환해야 함", async () => {
      const request = new NextRequest("http://localhost/api/vapi/webhook", {
        method: "POST",
        body: "invalid json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to process webhook");
    });
  });
});
