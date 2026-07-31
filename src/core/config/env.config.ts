import { z } from 'zod';

const envSchema = z.object({
    // Server API
    NEXT_PUBLIC_SERVER_API: z.string().url(),

    // Realtime API
    NEXT_PUBLIC_REALTIME_SERVER_API: z.string().url(),

    // Turn Server
    NEXT_PUBLIC_TURN_USERNAME: z.string().optional(),
    NEXT_PUBLIC_TURN_CREDENTIAL: z.string().optional(),

    // Node Env
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),

    // Google Client Id:
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),

    // Maintenance Mode Override from Client
    NEXT_PUBLIC_MAINTENANCE_MODE: z.string().optional().default('false'),
    NEXT_PUBLIC_MAINTENANCE_MESSAGE: z.string().optional(),
});

// Process env validation
const envProcess = envSchema.safeParse({
    NEXT_PUBLIC_SERVER_API: process.env.NEXT_PUBLIC_SERVER_API,
    NEXT_PUBLIC_REALTIME_SERVER_API:
        process.env.NEXT_PUBLIC_REALTIME_SERVER_API,
    NEXT_PUBLIC_TURN_USERNAME: process.env.NEXT_PUBLIC_TURN_USERNAME,
    NEXT_PUBLIC_TURN_CREDENTIAL: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE,
    NEXT_PUBLIC_MAINTENANCE_MESSAGE: process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE,
});

if (!envProcess.success) {
    console.error(
        '❌ Invalid environment variables:',
        envProcess.error.format()
    );
    throw new Error('Invalid environment variables');
}

export const env = envProcess.data;
