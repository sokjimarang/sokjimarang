import { NextRequest } from "next/server";

/**
 * Vapi Webhook 이벤트 타입
 */
interface VapiWebhookEvent {
  message: {
    type: string;
    status?: string;
    endedReason?: string;
    transcript?: string;
    call?: {
      id: string;
      status: string;
    };
    [key: string]: unknown;
  };
}

/**
 * Vapi Webhook 핸들러
 *
 * Vapi에서 발생하는 이벤트를 수신합니다:
 * - status-update: 통화 상태 변경
 * - end-of-call-report: 통화 종료 리포트
 * - transcript: 실시간 대화 기록
 *
 * @see https://docs.vapi.ai/server-url/events
 */
export async function POST(request: NextRequest) {
  try {
    const event: VapiWebhookEvent = await request.json();

    console.log("📞 Vapi Webhook Event:", JSON.stringify(event, null, 2));

    switch (event.message.type) {
      case "status-update":
        console.log("📊 Call status:", event.message.status);
        break;

      case "end-of-call-report":
        console.log("📋 Call ended:", event.message.endedReason);
        console.log("📝 Transcript:", event.message.transcript);
        break;

      case "transcript":
        console.log("🎤 Live transcript:", event.message.transcript);
        break;

      case "assistant-request":
        console.log("🤖 Assistant request received");
        break;

      default:
        console.log("❓ Unknown event type:", event.message.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return Response.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
