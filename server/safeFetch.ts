import { promises as dns } from "dns";

const PRIVATE_CIDRS: Array<[string, number, number]> = [
  ["10.0.0.0", 0x0a000000, 8],
  ["172.16.0.0", 0xac100000, 12],
  ["192.168.0.0", 0xc0a80000, 16],
  ["127.0.0.0", 0x7f000000, 8],
  ["169.254.0.0", 0xa9fe0000, 16],
  ["0.0.0.0", 0x00000000, 8],
  ["100.64.0.0", 0x64400000, 10],
  ["192.0.0.0", 0xc0000000, 24],
  ["198.18.0.0", 0xc6120000, 15],
  ["240.0.0.0", 0xf0000000, 4],
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (nums.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  return ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const int = ipv4ToInt(ip);
  if (int === null) return true;
  for (const [, base, prefix] of PRIVATE_CIDRS) {
    const mask = prefix === 32 ? 0xffffffff : (~0 << (32 - prefix)) >>> 0;
    if ((int & mask) === (base & mask)) return true;
  }
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
  if (lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("fe80")) return true;
  if (lower === "::" || lower === "0:0:0:0:0:0:0:0") return true;
  return false;
}

async function isHostnamePrivate(hostname: string): Promise<boolean> {
  const v4Addrs = await dns.resolve4(hostname).catch(() => [] as string[]);
  const v6Addrs = await dns.resolve6(hostname).catch(() => [] as string[]);

  for (const ip of v4Addrs) {
    if (isPrivateIPv4(ip)) return true;
  }
  for (const ip of v6Addrs) {
    if (isPrivateIPv6(ip)) return true;
  }
  if (v4Addrs.length === 0 && v6Addrs.length === 0) return true;
  return false;
}

export class SsrfBlockedError extends Error {
  constructor(reason: string) { super(`SSRF blocked: ${reason}`); this.name = "SsrfBlockedError"; }
}

export async function safeFetch(rawUrl: string, options?: RequestInit & { timeoutMs?: number }): Promise<Response> {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch {
    throw new SsrfBlockedError("invalid URL");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new SsrfBlockedError(`non-http scheme: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();

  if (isPrivateIPv4(hostname)) {
    throw new SsrfBlockedError("direct private IPv4 address");
  }
  if (isPrivateIPv6(hostname)) {
    throw new SsrfBlockedError("direct IPv6 loopback/private address");
  }

  const privateHost = await isHostnamePrivate(hostname);
  if (privateHost) {
    throw new SsrfBlockedError(`hostname ${hostname} resolves to private/internal IP`);
  }

  const { timeoutMs = 10000, ...fetchOptions } = options || {};

  return fetch(rawUrl, {
    ...fetchOptions,
    redirect: "error",
    signal: AbortSignal.timeout(timeoutMs),
  });
}
