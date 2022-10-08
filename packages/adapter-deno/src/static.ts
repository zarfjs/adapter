
import { serveDir } from "https://deno.land/std@0.144.0/http/file_server.ts";
import type { Zarf } from "https://deno.land/x/zarf@v0.0.1-alpha.20/core/server.ts";

export interface DenoPlatformCtx {
    env: unknown
    ctx: unknown
}

export interface AdapterContext<T extends Record<string, any> = {}> {
    // respondWith(response: Promise<Response> | Response): void;
    waitUntil?(promise: Promise<void | unknown>): void;
    signal?: {
      aborted: boolean;
    };
    platform: T,
    platformFetchMiss?: boolean
    [key: string]: unknown;
    [key: number]: unknown;
}

export type EtagAlgorithm = "fnv1a" | "sha-1" | "sha-256" | "sha-384" | "sha-512";

export interface ServeDirOptions {
    fsRoot?: string;
    urlRoot?: string;
    showDirListing?: boolean;
    showDotfiles?: boolean;
    enableCors?: boolean;
    quiet?: boolean;
    etagAlgorithm?: EtagAlgorithm;
    forwardOnError?: boolean,
}

export function createAdapter(app: Zarf, options?: ServeDirOptions) {
    return async function(request: Request, connInfo: Deno.Conn) {
        if(request.method === 'GET' || request.method === 'HEAD') {
            const url =  new URL(request.url)
            let pathname =  url.pathname.replace(/\/$/, '').substring(1)
            try {
                pathname = decodeURIComponent(pathname);
                url.pathname = '/' + pathname
            // deno-lint-ignore no-explicit-any
            } catch (err: any) {}
            try {
                const resp = await serveDir(new Request(url.toString(), request), {
                    fsRoot: "public",
                    ...options
                });
                if(!resp.ok && options?.forwardOnError) {
                    const adapterCtx: AdapterContext<DenoPlatformCtx> = {
                        // waitUntil: ctx?.waitUntil?.bind(ctx) ?? ((_f: any) => { }),
                        passThrough() {},
                        platform: { env: {}, ctx: {} },
                        platformFetchMiss: true, // Zarf can, or cannot generate error based on this flag/or it's server config
                        getClientAddress() {
                            const addr = connInfo.remoteAddr as Deno.NetAddr;
                            return addr.hostname || '';
                        }
                    };
                    // Forward, in hope of a response for GET calls, or trigger a error in Zarf
                    // Zarf can understand the conext, and deal with it accordingly
                    //
                    return app.handle(request, adapterCtx) as Promise<Response>;
                } else {
                    return resp
                }
            } catch(err: unknown) {
                return new Response('An unexpected error occurred while retrieving assets', { status: 500 })
            }

        } else {
            const adapterCtx: AdapterContext<DenoPlatformCtx> = {
                // waitUntil: ctx?.waitUntil?.bind(ctx) ?? ((_f: any) => { }),
                passThrough() {},
                platform: { env: {}, ctx: {} },
                getClientAddress() {
                    const addr = connInfo.remoteAddr as Deno.NetAddr;
                    return addr.hostname || '';
                }
            };
            return app.handle(request, adapterCtx) as Promise<Response>;
        }
    }
}
