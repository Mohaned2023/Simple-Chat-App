import { ThrottlerModuleOptions } from "@nestjs/throttler";

/**
 * This  configuration  settings are use\
 * to set the rate limiting in app. 
 */
export const rateLimitConfig: ThrottlerModuleOptions = [
    {
        name: 'short',
        ttl: 1 * 1000, // 1s
        limit: 3
    },
    {
        name: 'medium',
        ttl: 20 * 1000, // 20s
        limit: 10
    },
    {
        name: 'long',
        ttl: 60 * 1000, // 1m
        limit: 30
    }
]