import { ok } from 'assert'
/**
 * Get an available port
 * @returns
 */
export function getPort() {
    const env = process.env.PORT;
    if (env && /^\d+$/.test(env)) {
      return +env;
    }
    return 0; // random;
}

/**
 * Get hostname
 * @param server
 * @returns
 */
export function getHostname(server: any, hostname: string = '0.0.0.0') {
    const addressInfo = server.address();

    ok(typeof addressInfo !== "string");
    ok(addressInfo);

    const { port } = addressInfo;
    ok(port);

    return `http://${hostname}:${port}`;
}
