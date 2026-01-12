import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./src/__tests__/setup/msw-handlers";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
