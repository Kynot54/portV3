// Writes the e2e-only sample project's media to public/images/work/sample-media/:
// two flat 1920×1080 PNGs (Node's zlib, no package) and a ~2 s silent MP4
// recorded from a canvas in Playwright's Chromium. No third-party footage.
// Run once: node scripts/make-sample-media.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { chromium } from "@playwright/test";

const OUT = "public/images/work/sample-media";
mkdirSync(OUT, { recursive: true });

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
/** A 1920×1080 PNG: left half `a`, right half `b` (RGB). */
function png(a, b) {
  const [w, h] = [1920, 1080];
  const row = Buffer.alloc(1 + w * 3);
  for (let x = 0; x < w; x++) row.set(x < w / 2 ? a : b, 1 + x * 3);
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
writeFileSync(`${OUT}/1.png`, png([20, 20, 20], [57, 255, 20]));
writeFileSync(`${OUT}/2.png`, png([245, 245, 245], [255, 0, 128]));

const browser = await chromium.launch();
const page = await browser.newPage();
const b64 = await page.evaluate(async () => {
  const type = [
    "video/mp4;codecs=avc1",
    "video/mp4;codecs=vp9",
    "video/mp4",
  ].find((t) => MediaRecorder.isTypeSupported(t));
  if (!type) throw new Error("no MP4 recording in this Chromium");
  const c = Object.assign(document.createElement("canvas"), {
    width: 640,
    height: 360,
  });
  const g = c.getContext("2d");
  // Video only: a canvas stream has no audio track.
  const rec = new MediaRecorder(c.captureStream(30), { mimeType: type });
  const parts = [];
  rec.ondataavailable = (e) => parts.push(e.data);
  const done = new Promise((r) => (rec.onstop = r));
  rec.start();
  const t0 = performance.now();
  await new Promise((resolve) => {
    // A bar sliding slowly across: no flashing.
    const draw = () => {
      const t = (performance.now() - t0) / 2000;
      g.fillStyle = "#141414";
      g.fillRect(0, 0, 640, 360);
      g.fillStyle = "#39ff14";
      g.fillRect(40, 150, 560 * Math.min(t, 1), 60);
      if (t < 1) requestAnimationFrame(draw);
      else resolve();
    };
    draw();
  });
  rec.stop();
  await done;
  const buf = await new Blob(parts, { type }).arrayBuffer();
  let s = "";
  for (const byte of new Uint8Array(buf)) s += String.fromCharCode(byte);
  return btoa(s);
});
await browser.close();
writeFileSync(`${OUT}/clip.mp4`, Buffer.from(b64, "base64"));
console.log("wrote", OUT);
