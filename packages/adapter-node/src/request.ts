import type { IncomingMessage } from 'http'
/**
 * Get request from the incoming message
 * @param message
 * @param baseUrl
 * @returns
 */
export function getRequest(message: IncomingMessage, baseUrl?: string) {
    const url = new URL(message.url || '', baseUrl);
    let body;
    if (message.method !== "GET" && message.method !== "HEAD") {
      body = createReadableStreamFromIterable(message);
    }

    // Copy all the headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(message.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          headers.append(key, item);
        }
      }
    }

    return new Request(url as unknown as RequestInfo, {
      method: message.method,
      headers,
      body
    });
}

function createReadableStreamFromIterable(
    iterable: AsyncIterable<unknown>
  ) {
    const source = createSourceFromIterable(iterable);
    return new ReadableStream(source);
}

function createSourceFromIterable(
    iterable: AsyncIterable<unknown>
  ): UnderlyingSource {
    const encoder = new TextEncoder();
    let iterator: AsyncIterator<unknown>;
    return {
      start() {
        iterator = iterable[Symbol.asyncIterator]();
      },
      async pull(controller) {
        try {
          const { value, done } = await iterator.next();
          if (done) {
            controller.close();
          } else {
            let enqueue = value;
            if (typeof enqueue === "string") {
              enqueue = encoder.encode(enqueue);
            }
            controller.enqueue(enqueue);
          }
        } catch (error) {
          throw error;
        }
      },
      async cancel() {
        // @ts-ignore
        await iterator.return();
      },
    };
}
