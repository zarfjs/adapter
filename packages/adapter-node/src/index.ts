// @ts-ignore
import { Server, ServerResponse, IncomingMessage } from 'http'
import type { Zarf } from '@zarfjs/zarf'

// @ts-ignore
import { createServer as createHttpServer } from 'http'
import { installPolyfills } from '@zarfjs/polyfills'
import { getHostname, getPort } from './server'
import { getRequest } from './request'

installPolyfills()

export interface ServerListenerOptions {

    port?: number,
    development?: boolean,
    hostname?: string,
    log?: boolean
}

interface HttpsOptions {

}

export function createServer(app: Zarf, options: HttpsOptions) {

    const server = createHttpServer((message: IncomingMessage, response: ServerResponse) => {
      void onMessage(message, response);
    });

    return {
        async listen({
            port = getPort(),
            development = true,
            hostname,
            log = true
        }: ServerListenerOptions, startedCb?: (server: Server) => void) {
            return await new Promise<void>((resolve) => {
                if(log) console.log(`server started on ${port}`)

                server.listen(port, startedCb ? resolve(startedCb(server)) : resolve)
                const url = getHostname(server, hostname);

                return {
                    url,
                    stop: () => {
                      return new Promise<void>((resolve, reject) =>
                        server.close((error: any) => {
                          if (error) {
                            reject(error);
                          } else {
                            resolve();
                          }
                        })
                      );
                    },
                } as const;
            });
        }
    }

    async function onMessage(
      message: IncomingMessage,
      srvResp: ServerResponse
    ) {
      let respSent = false;

      /**
       * Handle request
       */
      try {
        const request = getRequest(message, getHostname(server))
        const response = await app.handle(request)
        // @ts-ignore
        await send(response);
      } catch (error) {
        await send(new Response('', {
            status: 500,
          })
        );
      } finally {
        try {
            srvResp.end();
        } catch {}
      }

      /**
       * Send response
       * @param response
       * @returns
       */
      async function send(response: Response) {
        if (respSent) return;
        respSent = true;

        // @ts-ignore
        const { body, headers } = response;
        headers.forEach((value, key) => {
            srvResp.setHeader(key, value);
        });
        srvResp.writeHead(response.status, response.statusText);

        if (body) {
          return await body.pipeTo(
            new WritableStream({
              write(chunk) {
                srvResp.write(chunk);
              },
            })
          );
        }
      }
    }
  }
