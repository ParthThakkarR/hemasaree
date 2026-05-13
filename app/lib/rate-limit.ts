const rateLimitMap = new Map();

export function rateLimiter({
  interval = 60 * 1000, // 1 minute
  uniqueTokenPerInterval = 500,
  maxRequests = 10, // Max 10 requests per interval
}) {
  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = rateLimitMap.get(token) || [0];
        if (tokenCount[0] === 0) {
          rateLimitMap.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;

        // Reset rate limiter logic
        setTimeout(() => {
          const currentCount = rateLimitMap.get(token) || [0];
          currentCount[0] -= 1;
          if (currentCount[0] === 0) {
            rateLimitMap.delete(token);
          }
        }, interval);

        if (isRateLimited) {
          reject('Rate limit exceeded');
        } else {
          resolve();
        }
      }),
  };
}

