import { readFileStr, writeFileStr, EOL } from "https://deno.land/std@0.53.0/fs/mod.ts";

const isWindows = Deno.build.os === "windows";
const hosts = isWindows
  ? "C:/Windows/System32/drivers/etc/hosts"
  : "/etc/hosts";
const localhost = "127.0.0.1";
const eol = isWindows ? EOL.CRLF : EOL.LF;

const get = async () => {
  const str = await readFileStr(hosts);
  const lines = str.split(eol);
  return lines;
};

const setSingleLine = async (ip: string, host: string) => {
  const lines = await get();
  const existed = lines.findIndex((i) => i.includes(host));
  if (existed !== -1) {
    const oldLine = lines[existed];
    const [_, h] = oldLine.trim().split(" ").map((i) => i.trim());
    const newLine = ip + " " + h;
    lines[existed] = newLine;
    return lines;
  }

  lines.push(ip + " " + host);
  return lines;
};

const removeSingleLine = async (host: string) => {
  const lines = await get();
  let existed = lines.findIndex((i) => i.includes(host));

  while (existed !== -1) {
    lines.splice(existed, 1);
    existed = lines.findIndex((i) => i.includes(host));
  }

  return lines;
};

const set = async (lines: string[]) => {
  const str = lines.join(eol);
  await writeFileStr(hosts, str);
};

export const block = async (host: string) => {
  const lines = await setSingleLine(localhost, host);
  await set(lines);
};

export const unblock = async (host: string) => {
  const lines = await removeSingleLine(host);
  await set(lines);
};


const cmd = Deno.args[0];
const host = Deno.args[1];

if (!host) {
  throw new Error("must have valid host");
}

if (cmd === "block") {
  block(host);
} else if (cmd === "unblock") {
  unblock(host);
} else {
  throw new Error("cmd is not found");
}
