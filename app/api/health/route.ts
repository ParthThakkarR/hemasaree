import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { createClient } from 'redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const healthCheck: any = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    services: {},
  };

  try {
    // Check Database (MongoDB compatible)
    await prisma.user.count();
    healthCheck.services.database = 'UP';
  } catch (error) {
    healthCheck.services.database = 'DOWN';
    healthCheck.message = 'ERROR';
  }

  try {
    // Check Redis
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    });
    await redisClient.connect();
    await redisClient.ping();
    await redisClient.disconnect();
    healthCheck.services.redis = 'UP';
  } catch (error) {
    healthCheck.services.redis = 'DOWN';
    healthCheck.message = 'ERROR';
  }

  return NextResponse.json(healthCheck, {
    status: healthCheck.message === 'OK' ? 200 : 503,
  });
}

