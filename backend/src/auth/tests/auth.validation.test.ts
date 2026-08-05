import assert from "node:assert/strict";
import test from "node:test";

import { parseLoginInput } from "../auth.validation.js";

test("parseLoginInput normalizes a login payload", () => {
  const input = parseLoginInput(
    {
      email: "USER@example.com",
      password: "Customer#2026",
    },
    "127.0.0.1",
    "test-agent",
  );

  assert.deepEqual(input, {
    email: "user@example.com",
    password: "Customer#2026",
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
  });
});
