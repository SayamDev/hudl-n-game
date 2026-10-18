import { test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { createPackStudio, validateDraft } from "./pack-studio.mjs";
const valid = {
  name: "Space party",
  words: ["Moon", "Rocket", "Comet", "Star", "Orbit", "Planet"],
};
function call(
  handler,
  {
    method = "POST",
    path = "/api/pack-studio",
    body = { theme: "Space party", count: 12 },
    origin = "http://localhost:4173",
    ip = "local",
  } = {},
) {
  const req = Readable.from([
    Buffer.from(typeof body === "string" ? body : JSON.stringify(body)),
  ]);
  Object.assign(req, {
    url: path,
    method,
    headers: {
      origin,
      host: "localhost:4173",
      "content-type": "application/json",
    },
    socket: { remoteAddress: ip },
  });
  return new Promise((resolve, reject) => {
    const res = {
      writeHead(code) {
        this.code = code;
      },
      end(data) {
        resolve({ code: this.code, data: JSON.parse(data) });
      },
    };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}
const env = {
  GROQ_API_KEY: "test-key-never-real",
  GROQ_FREE_TIER_CONFIRMED: "true",
};
const success = async () => ({
  ok: true,
  status: 200,
  json: async () => ({
    choices: [{ message: { content: JSON.stringify(valid) } }],
  }),
});
test("disabled without key or explicit free account confirmation", async () => {
  for (const config of [{}, { GROQ_API_KEY: "test" }]) {
    let requests = 0;
    const handler = createPackStudio({
      env: config,
      fetcher: async () => {
        requests++;
      },
    });
    assert.equal((await call(handler)).code, 503);
    assert.equal(requests, 0);
    assert.equal(
      (await call(handler, { method: "GET", path: "/api/pack-studio/status" }))
        .data.available,
      false,
    );
  }
});
test("rejects foreign origins, oversized bodies and malformed themes before generation", async () => {
  let requests = 0;
  const handler = createPackStudio({
    env,
    fetcher: async () => {
      requests++;
      return success();
    },
  });
  assert.equal(
    (await call(handler, { origin: "https://other.example" })).code,
    403,
  );
  assert.equal((await call(handler, { body: "x".repeat(5000) })).code, 413);
  assert.equal(
    (await call(handler, { body: { theme: "x", count: 999 } })).code,
    400,
  );
  assert.equal(requests, 0);
});
test("sends only bounded theme and count, validates response, never returns key", async () => {
  let payload;
  const handler = createPackStudio({
    env,
    fetcher: async (url, options) => {
      assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
      payload = JSON.parse(options.body);
      return success();
    },
  });
  const response = await call(handler, {
    body: {
      theme: "Space",
      count: 12,
      players: ["private name"],
      history: ["secret"],
    },
  });
  assert.equal(response.code, 200);
  assert.deepEqual(response.data.draft, { ...valid, adult: false });
  assert.deepEqual(JSON.parse(payload.messages[1].content), {
    theme: "Space",
    wordCount: 12,
  });
  assert.ok(!JSON.stringify(response).includes(env.GROQ_API_KEY));
});
test("enforces per-client allowance and rolls it over after an hour", async () => {
  let time = 0;
  const handler = createPackStudio({ env, fetcher: success, now: () => time });
  for (let i = 0; i < 3; i++) assert.equal((await call(handler)).code, 200);
  assert.equal((await call(handler)).code, 429);
  time = 3600001;
  assert.equal((await call(handler)).code, 200);
});
test("global daily cap holds across clients and resets next UTC day", async () => {
  let time = 0;
  const handler = createPackStudio({ env, fetcher: success, now: () => time });
  for (let i = 0; i < 20; i++)
    assert.equal((await call(handler, { ip: String(i) })).code, 200);
  assert.equal((await call(handler, { ip: "next" })).code, 429);
  time = 86400001;
  assert.equal((await call(handler, { ip: "next" })).code, 200);
});
test("provider limit and malformed output fail clearly, with no paid retry", async () => {
  const limited = createPackStudio({
    env,
    fetcher: async () => ({ ok: false, status: 429 }),
  });
  assert.equal((await call(limited)).code, 429);
  const broken = createPackStudio({
    env,
    fetcher: async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: "not json" } }] }),
    }),
  });
  assert.equal((await call(broken)).code, 502);
  assert.throws(() =>
    validateDraft({ name: "Duplicates", words: Array(8).fill("Moon") }),
  );
});

test('bounded prior words guide fresh batches and malformed exclusions are rejected', async () => {
  let payload;
  const handler = createPackStudio({env, fetcher: async (url, options) => { payload = JSON.parse(options.body); return success(); }});
  const result = await call(handler, {body: {theme:'Space party', count:12, exclude:['Moon','Comet']}});
  assert.equal(result.code, 200);
  assert.deepEqual(JSON.parse(payload.messages[1].content).avoidWords, ['Moon','Comet']);
  assert.equal((await call(handler, {body:{theme:'Space party', count:12, exclude:['x'.repeat(61)]}})).code,400);
  assert.equal((await call(handler, {body:{theme:'Space party', count:12, exclude:Array(49).fill('Moon')}})).code,400);
});
