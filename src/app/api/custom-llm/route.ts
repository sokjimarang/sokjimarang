import { createGeminiClient, GEMINI_MODEL } from "@/lib/gemini/client";
import { SCAM_SCENARIO_SYSTEM_PROMPT } from "@/lib/gemini/prompts";

export const runtime = "edge";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CustomLLMRequest {
  messages: Message[];
  model?: string;
  stream?: boolean;
  temperature?: number;
}

/**
 * Vapi Custom LLM 엔드포인트
 *
 * Vapi가 호출하는 OpenAI 호환 /chat/completions 엔드포인트입니다.
 * Gemini API를 호출하고 결과를 OpenAI 형식으로 반환합니다.
 *
 * @see https://docs.vapi.ai/customization/custom-llm/using-your-server
 */
export async function POST(request: Request) {
  try {
    const body: CustomLLMRequest = await request.json();
    const { messages, stream = true, temperature = 0.7 } = body;

    const gemini = createGeminiClient();

    const systemMessage = messages.find((m) => m.role === "system");
    const hasCustomSystemPrompt =
      systemMessage?.content && systemMessage.content.length > 0;

    const messagesWithSystem: Message[] = hasCustomSystemPrompt
      ? messages
      : [
          { role: "system", content: SCAM_SCENARIO_SYSTEM_PROMPT },
          ...messages.filter((m) => m.role !== "system"),
        ];

    if (stream) {
      const response = await gemini.chat.completions.create({
        model: GEMINI_MODEL,
        messages: messagesWithSystem,
        stream: true,
        temperature,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const data = JSON.stringify(chunk);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (error) {
            console.error("Streaming error:", error);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const completion = await gemini.chat.completions.create({
      model: GEMINI_MODEL,
      messages: messagesWithSystem,
      temperature,
    });

    return Response.json(completion);
  } catch (error) {
    console.error("Custom LLM error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      {
        error: {
          message: errorMessage,
          type: "server_error",
        },
      },
      { status: 500 }
    );
  }
}
