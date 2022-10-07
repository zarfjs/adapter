import type { Server, Errorlike } from 'bun';
import type { Zarf } from '@zarfjs/zarf'
import { getBunPort } from './server'

export interface ListenerOptions {
    port?: number,
    development?: boolean,
    hostname?: string,
    log?: boolean,
}

type BunServer = Omit<Server, 'pendingRequests'>
type ListenerCallback = (server: BunServer) => void

type CertFilePath = `./${string}.pem`
interface HttpsOptions {
    certFile: CertFilePath,
    keyFile: CertFilePath,
}

export function createServer(app: Zarf, options?: HttpsOptions): { listen: (options: ListenerOptions, startedCb?: ListenerCallback) => Promise<BunServer|void>} {
    if (!Bun) throw new Error('This adapater is Bun only. Please install Bun and try again!')

    return {
        async listen(opts?: ListenerOptions, startedCb?: ListenerCallback) {
            const {
                port,
                hostname,
                development,
                log
            } = { ...{
                port: getBunPort(),
                hostname: '0.0.0.0',
                development: process.env.NODE_ENV !== "production",
                log: true
            }, ...opts}
            const httpsOptions = options && options.certFile && options.keyFile  ? options : {}
            return await new Promise<void>((resolve) => {
                const server = Bun.serve({
                    port,
                    hostname,
                    development,
                    async fetch(req: Request) {
                        return await app.handle(req) as unknown as Promise<Response>
                    },
                    error(err: Errorlike) {
                        // return new Response("uh oh! :(" + String(err.toString()), { status: 500 });
                        return app.serverErrorHandler(err)
                    },
                    ...httpsOptions
                })

                async function stop() {
                    if(!server) {
                        return console.error(`Can't shutdown as server isn't up currently`)
                    }
                    if(server?.pendingRequests) {
                        return console.error(`Can't shutdown as there are pending requests. You might wanna wait or forcibly shut the server instance?`)
                    }
                    return await server?.stop()
                }

                const url = `http://${hostname}:${port}`;
                if(log) console.info(`Server started on ${url}`)

                const _srv = {
                    hostname: hostname!,
                    port,
                    url,
                    development,
                    stop,
                } as const

                if(startedCb && typeof startedCb === 'function') {
                    return startedCb(_srv)
                }

                return _srv
            })
        }
    }
}
