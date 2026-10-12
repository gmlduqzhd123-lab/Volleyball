import { Resvg } from "@resvg/resvg-js";
import { mkdir, writeFile } from "node:fs/promises";
// Original vector artwork; the ball stays inside the maskable icon safe zone.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="0" fill="#194a3a"/><circle cx="256" cy="256" r="166" fill="#f8f5e8"/><g fill="none" stroke="#194a3a" stroke-width="13" stroke-linecap="round"><path d="M256 90C216 160 221 220 256 256C295 291 353 308 413 292"/><path d="M100 312C178 309 233 291 256 256C285 213 298 151 285 94"/><path d="M372 374C333 307 293 269 256 256C208 244 153 258 107 282"/><path d="M170 115C135 183 139 240 166 270"/><path d="M409 192C351 201 301 222 279 260"/><path d="M232 419C208 363 201 311 218 271"/></g><circle cx="390" cy="115" r="22" fill="#d4df83"/></svg>`;
await mkdir("public/icons", { recursive: true });
await writeFile("public/icons/ball.svg", svg);
for (const size of [180, 192, 512]) {
  await writeFile(`public/icons/ball-${size}.png`, new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng());
}
