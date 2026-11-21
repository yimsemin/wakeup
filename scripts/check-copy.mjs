import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const catalog = source.match(/^  const COPY = (\{[\s\S]*?^  \});/m);
assert.ok(catalog, "Missing COPY catalog in app.js");
const { ko, en } = runInNewContext(`(${catalog[1]})`);

function checkPair(koValue, enValue, key = "COPY") {
  if (typeof koValue !== "string") {
    assert.ok(enValue && typeof enValue === "object" && Array.isArray(koValue) === Array.isArray(enValue), key);
    assert.deepEqual(Object.keys(koValue).sort(), Object.keys(enValue).sort(), key);
    for (const child of Object.keys(koValue)) {
      checkPair(koValue[child], enValue[child], `${key}.${child}`);
    }
    return;
  }

  assert.equal(typeof enValue, "string", key);
  assert.ok(koValue.trim() && enValue.trim(), `${key} is empty`);
  const placeholders = value => (value.match(/\{\w+\}/g) ?? []).sort();
  assert.deepEqual(placeholders(koValue), placeholders(enValue), `${key} placeholders`);
  assert.doesNotMatch(enValue, /\p{Script=Hangul}/u, `${key} contains Korean in English copy`);
  assert.doesNotMatch(`${koValue}\n${enValue}`, /화면 잠금 방지|NotAllowedError/u, `${key} uses internal terminology`);
  if (!/^COPY\.faq/u.test(key)) {
    assert.doesNotMatch(`${koValue}\n${enValue}`, /\bwake lock\b/iu, `${key} uses the API name outside the FAQ`);
  }
}

checkPair(ko, en);

// The static page uses the same Korean strings before app.js runs.
const referenced = new Set();
for (const match of html.matchAll(/<([a-z][\w-]*)\b([^<>]*\bdata-i18n(-aria|-content)?="(\w+)"[^<>]*)>/gi)) {
  const [tag, name, attributes, binding, key] = match;
  let fallback;
  if (binding) {
    const attribute = binding === "-aria" ? "aria-label" : "content";
    fallback = attributes.match(new RegExp(`(?:^|\\s)${attribute}="([^"]*)"`))?.[1];
  } else {
    const start = match.index + tag.length;
    const end = html.indexOf(`</${name}>`, start);
    assert.ok(end >= start, `Missing end tag for ${key}`);
    fallback = html.slice(start, end).trim().replace(/\s+/g, " ");
  }
  assert.equal(typeof ko[key], "string", `Missing HTML copy key ${key}`);
  assert.equal(fallback, ko[key], `Korean HTML fallback for ${key}`);
  referenced.add(key);
}

for (const [, key] of source.matchAll(/\b(?:copy|COPY\[language\])\.(\w+)/g)) {
  assert.ok(Object.hasOwn(ko, key), `Missing app.js copy key ${key}`);
  referenced.add(key);
}
assert.deepEqual([...referenced].sort(), Object.keys(ko).sort(), "Unused COPY keys");

const structuredData = Array.from(
  html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ([, json]) => JSON.parse(json)
);
const faq = structuredData.find(item => item["@type"] === "FAQPage");
assert.equal(faq?.inLanguage, "ko");
const questions = Object.keys(ko).filter(key => /^faq\w+Q$/.test(key));
assert.deepEqual(
  faq.mainEntity.map(item => [item.name, item.acceptedAnswer.text]),
  questions.map(key => [ko[key], ko[`${key.slice(0, -1)}A`]]),
  "FAQPage must match the Korean FAQ copy"
);

console.log("Korean and English copy, Korean HTML fallbacks, and FAQ structured data match.");
