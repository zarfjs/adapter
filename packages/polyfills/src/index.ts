import { fetch, Response, Request, Headers, FormData } from 'undici';
import { ReadableStream, TransformStream, WritableStream } from 'stream/web';
import { webcrypto as crypto } from 'crypto';

const globalsFetch: Record<string, any> = {
	fetch,
	Response,
	Request,
	Headers,
    FormData
};

const globalsStream: Record<string, any> = {
	ReadableStream,
	TransformStream,
	WritableStream,
};

const globalsCrypto: Record<string, any> = {
	crypto
};

const globals: Record<string, any> = {
    ...globalsFetch,
    ...globalsStream,
    ...globalsCrypto
}

export function installFetchPolyfills() {
	for (const name in globalsFetch) {
		Object.defineProperty(globalThis, name, {
			enumerable: true,
			configurable: true,
			writable: true,
			value: globalsFetch[name]
		});
	}
}
export function installStreamPolyfills() {
	for (const name in globalsStream) {
		Object.defineProperty(globalThis, name, {
			enumerable: true,
			configurable: true,
			writable: true,
			value: globalsStream[name]
		});
	}
}
export function installCryptoPolyfills() {
	for (const name in globalsCrypto) {
		Object.defineProperty(globalThis, name, {
			enumerable: true,
			configurable: true,
			writable: true,
			value: globalsCrypto[name]
		});
	}
}

export function installPolyfills() {
	for (const name in globals) {
		Object.defineProperty(globalThis, name, {
			enumerable: true,
			configurable: true,
			writable: true,
			value: globals[name]
		});
	}
}
