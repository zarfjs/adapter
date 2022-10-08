/// <reference types='@cloudflare/workers-types'/>
/// <reference path=".d.ts"/>
import type { Zarf } from '@zarfjs/zarf'
import type { AdapterContext, CloudflareWorkersPlatformCtx } from './types';
import { getAssetFromKV, NotFoundError } from '@cloudflare/kv-asset-handler'
// @ts-ignore
import staticAssetManifest from '__STATIC_CONTENT_MANIFEST'
const manifestJson = JSON.parse(staticAssetManifest)

interface StaticFetchAdapterOptions {
    forwardOnNotFound?: boolean,
    assumeExtHtml?: boolean,
    cors?: boolean
}

const DEFAULT_ADAPTER_OPTIONS: StaticFetchAdapterOptions =  {
    forwardOnNotFound: true,
    cors: false,
}

export function createStaticFetchAdapter(
    app: Zarf,
    options?: StaticFetchAdapterOptions
  ): ExportedHandlerFetchHandler {
    const opts = { ...DEFAULT_ADAPTER_OPTIONS, options }
    return async function fetchHandler(request, env: any, ctx) {
        if(request.method === 'GET' || request.method === 'HEAD') {
            let url =  new URL(request.url)
            let pathname =  url.pathname.replace(/\/$/, '').substring(1)
            try {
                pathname = decodeURIComponent(pathname);
                url.pathname = '/' + pathname
            } catch (err) {}
            try {
                const response = await getAssetFromKV({
                    request: new Request(url.toString(), request),
                    waitUntil: (promise) => ctx.waitUntil(promise)
                }, {
                    ASSET_NAMESPACE: env.__STATIC_CONTENT,
                    ASSET_MANIFEST: manifestJson
                })
                // https://developers.cloudflare.com/cache/about/cache-control/
                const cacheCtrlHeader = url.pathname.startsWith('/immutable') ? `public, immutable, max-age=31536000` : `no-cache`
                response.headers.set('Cache-Control', cacheCtrlHeader)
                response.headers.set('X-Robots-Tag', 'noindex')
                if(options?.cors) {
                    response.headers.append('Access-Control-Allow-Origin', '*')
                }
                return response
            } catch(error) {
                if (error instanceof NotFoundError) {
                    if(opts && opts.forwardOnNotFound) {
                        const adapterCtx: AdapterContext<CloudflareWorkersPlatformCtx> = {
                            waitUntil: ctx?.waitUntil?.bind(ctx) ?? ((_f: any) => { }),
                            passThrough() {},
                            platform: { env, ctx },
                            getClientAddress() {
                                return request.headers.get("CF-Connecting-IP") || ""
                            }
                        };
                        return app.handle(request, adapterCtx) as Promise<Response>;
                    } else {
                        return new Response('The requested asset cannot be found', { status: 404 })
                    }
                }else {
                    return new Response('An unexpected error occurred while retrieving assets', { status: 500 })
                }
            }
       }

       const adapterCtx: AdapterContext<CloudflareWorkersPlatformCtx> = {
        waitUntil: ctx?.waitUntil?.bind(ctx) ?? ((_f: any) => { }),
        passThrough() {},
        platform: { env, ctx },
        getClientAddress() {
            return request.headers.get("CF-Connecting-IP") || ""
        }
      };

      return app.handle(request, adapterCtx) as Promise<Response>;
    };
}
