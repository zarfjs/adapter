/// <reference types='@cloudflare/workers-types'/>

// Fetch global
const globalFetch = fetch;
export type Fetch = typeof globalFetch;

export interface CloudflareWorkersPlatformCtx {
    env: unknown
    ctx: ExecutionContext
}

export interface AdapterContext<T extends Record<string, any> = {}> {
    // respondWith(response: Promise<Response> | Response): void;
    waitUntil?(promise: Promise<void | unknown>): void;
    signal?: {
      aborted: boolean;
    };
    platform: T,
    [key: string]: unknown;
    [key: number]: unknown;
}
