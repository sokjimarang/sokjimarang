import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

interface ChatCompletionRequest {
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  model?: string;
  temperature?: number;
}

const geminiHandlers = [
  http.post(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    async ({ request }) => {
      const body = (await request.json()) as ChatCompletionRequest;

      if (body.stream) {
        const encoder = new TextEncoder();
        const chunks = [
          {
            id: "chunk-1",
            object: "chat.completion.chunk",
            created: Date.now(),
            model: "gemini-2.0-flash",
            choices: [{ index: 0, delta: { content: "안녕" }, finish_reason: null }],
          },
          {
            id: "chunk-2",
            object: "chat.completion.chunk",
            created: Date.now(),
            model: "gemini-2.0-flash",
            choices: [{ index: 0, delta: { content: "하세요" }, finish_reason: null }],
          },
          {
            id: "chunk-3",
            object: "chat.completion.chunk",
            created: Date.now(),
            model: "gemini-2.0-flash",
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          },
        ];

        const stream = new ReadableStream({
          start(controller) {
            chunks.forEach((chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        });

        return new HttpResponse(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      }

      return HttpResponse.json({
        id: "test-completion-id",
        object: "chat.completion",
        created: Date.now(),
        model: "gemini-2.0-flash",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "금융감독원 김철수 조사관입니다.",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      });
    }
  ),
];

export const geminiErrorHandler = http.post(
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  () => {
    return HttpResponse.json(
      { error: { message: "API Error", type: "server_error" } },
      { status: 500 }
    );
  }
);

export const handlers = [...geminiHandlers];
export const server = setupServer(...handlers);
