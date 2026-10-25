// 배포 대상 정적 파일을 내용 변경 없이 dist/로 복사한다. Node 내장 모듈만 사용.
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "dist");
const files = [
  "index.html",
  "app.js",
  "styles.css",
  "sw.js",
  "manifest.webmanifest",
  "icons",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "_headers",
  "_redirects"
];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const name of files) {
  cpSync(join(root, name), join(out, name), { recursive: true });
}
console.log(`built ${files.length} entries -> dist/`);
