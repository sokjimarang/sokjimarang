import { z } from "zod";

const envSchema = z.object({
  VAPI_PRIVATE_KEY: z.string().min(1, "VAPI_PRIVATE_KEY is required"),
  NEXT_PUBLIC_VAPI_PUBLIC_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_VAPI_PUBLIC_KEY is required"),
  VAPI_PHONE_NUMBER_ID: z.string().optional(),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  WEBHOOK_SECRET: z.string().min(1, "WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_BASE_URL: z.string().url("NEXT_PUBLIC_BASE_URL must be a valid URL"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = validateEnv();
