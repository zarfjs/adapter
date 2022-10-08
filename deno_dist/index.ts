import type { Zarf } from "https://deno.land/x/zarf@v0.0.1-alpha.20/index.ts"
import * as flags from "https://deno.land/std/flags/mod.ts";
export interface ListenerOptions {
    port?: number,
    development?: boolean,
    hostname?: string,
    log?: boolean
}

type ListenerCallback = (server: DenoServer) => void

type CertFileExt = 'crt' | 'pem'
type KeyFileExt = 'key' | 'pem'
type CertFilePath = `./${string}.${CertFileExt}`
type KeyFilePath = `./${string}.${KeyFileExt}`

interface HttpsOptions {
    certFile: CertFilePath,
    keyFile: KeyFilePath,
}

type DenoServer = {
    hostname: string,
    port: number,
    url: string,
    development: boolean,
    stop: () => void,
}

function getPort() {
    try {
      const env = Deno.env.get("PORT");
      if (env && /^\d+$/.test(env)) {
        return +env;
      }
    } catch {
        return 0;
    }
    return 0;
}

export function createServer(app: Zarf, options?: HttpsOptions): { listen: (options: ListenerOptions, startedCb?: ListenerCallback) => Promise<DenoServer|void>} {

    if (self.location.protocol === 'https:' || self.location.port === '433') {
        const { cert: certFile, key: keyFile } = flags.parse(Deno.args, {
          alias: {
            cert: ['c', 'cert-file'],
            key: ['k', 'key-file'],
          }
        });

        if (!certFile || !keyFile) {
          throw new Error(`When using HTTPS or port 443, a --cert and --key are required.`);
        }
        if(!options) {
            options = { certFile, keyFile }
        } else {
            options = { certFile, keyFile }
        }
    }

    if(options && !options.certFile || !options?.keyFile) {
        throw new Error(`When using HTTPS options, the path to cert and key files are required.`);
    }

    return {
        async listen(opts?: ListenerOptions, startedCb?: ListenerCallback) {
            const {
                port,
                hostname,
                development,
                log
            } = { ...{
                port: getPort(),
                hostname: '0.0.0.0',
                development: Deno.env.get('MODE') !== "production",
                log: true
            }, ...opts}
            const httpsOptions = options && options.certFile && options.keyFile  ? options : false
            return await new Promise<void>((resolve) => {
                try {
                    const server = httpsOptions ? Deno.listenTls({
                        hostname,
                        port: 443,
                        certFile: httpsOptions.certFile,
                        keyFile: httpsOptions.keyFile,
                        alpnProtocols: ["h2", "http/1.1"],
                      }) :
                       Deno.listen({ hostname, port });
                    const url = `http://${hostname}:${server.addr.port}`;
                    const abortController = new AbortController();

                    // deno-lint-ignore no-inner-declarations
                    async function handleConn(conn: Deno.Conn) {
                        const httpConn = Deno.serveHttp(conn);
                        abortController.signal.addEventListener("abort", ()=> {
                            try {
                                httpConn.close()
                            // deno-lint-ignore no-empty
                            } catch(_e: unknown) {

                            }
                        })
                        for await (const requestEvent of httpConn) {
                            await requestEvent.respondWith(app.handle(requestEvent.request) as Response | Promise<Response>).catch((err: any ) => console.log(err));
                        }
                    }

                    const done = (async function watchConn(){
                        const _srv = {
                            hostname,
                            port,
                            url,
                            development,
                            stop,
                        } as const
                        if(log) console.info(`Server started on ${url}`)
                        if(startedCb && typeof startedCb === 'function') {
                            resolve(startedCb(_srv))
                        }
                        for await (const conn of server){
                            handleConn(conn)
                        }
                    })()
                    done.catch(error => console.log(error))

                    // deno-lint-ignore no-inner-declarations
                    async function stop() {
                        if(log) console.info(`Shutting down the server`)
                        await server.close();
                        abortController.abort();
                    }

                    return {
                        hostname,
                        port,
                        url,
                        development,
                        stop,
                    } as const
                // deno-lint-ignore no-explicit-any
                } catch(e: any) {
                    if (e.code === "EADDRINUSE") {
                        console.log(`Address in use. Please remove the provided port(${port}) and let Zarf find an open port for you`);
                        // setTimeout(() => {
                        //  const server = Deno.listen({ port: getPort() });

                        // }, 1000);
                    }
                }

            })
        }
    }
}
