import { Server } from "bun";

declare var Bun: {
    env: Record<string, string | undefined>;
};

export function getBunPort() {
    try {
      const env = Bun.env["PORT"];
      if (env && /^\d+$/.test(env)) {
        return +env;
      }
    } catch {}
    return getRandomPort()
}

export function getRandomPort() {
    const max = 65535;
    const half = max / 2;
    return Math.min(Math.round(half + half * Math.random()), max);
}
