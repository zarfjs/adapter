/// <reference types='@cloudflare/workers-types'/>
import type { Zarf } from '@zarfjs/zarf'
import type { AdapterContext, CloudflareWorkersPlatformCtx } from './types';

export function createFetchAdapter(
    app: Zarf,
  ): ExportedHandlerFetchHandler {
    return async function fetchHandler(request, env, ctx) {
      const adapterCtx: AdapterContext<CloudflareWorkersPlatformCtx> = {
        waitUntil: ctx?.waitUntil?.bind(ctx) ?? ((_f: any) => { }),
        passThrough() {

        },
        platform: { env, ctx },
        getClientAddress() {
            return request.headers.get("CF-Connecting-IP") || ""
        }
      };

      return app.handle(request, adapterCtx) as Promise<Response>;
    };
}
