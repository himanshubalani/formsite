import { JWT } from "google-auth-library";
import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(32).describe('Secret Key for JWT Tokens (min 32 chars)')
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
