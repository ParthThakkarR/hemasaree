import { NextResponse } from "next/server";
import { rateLimit } from "./rate-limit-redis";

export function withRateLimit(
  handler: Function,
  { limit, windowInSeconds }: { limit: number; windowInSeconds: number }
) {
  return async (req: Request, ...args: any[]) => {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const path = new URL(req.url).pathname;
    const key = `ratelimit:${ip}:${path}`;

    const { success, remaining, limit: rateLimitValue } = await rateLimit(key, limit, windowInSeconds);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitValue.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
          },
        }
      );
    }

    const response = await handler(req, ...args);
    
    // Add rate limit headers to the response
    if (response instanceof NextResponse) {
      response.headers.set("X-RateLimit-Limit", rateLimitValue.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
    }

    return response;
  };
}
