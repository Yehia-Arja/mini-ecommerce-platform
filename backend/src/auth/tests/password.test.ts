import assert from "node:assert/strict";
import test from "node:test";

import { hashPassword, verifyPassword } from "../password.js";

test("hashPassword and verifyPassword work together", async () => {
  const hashedPassword = await hashPassword("Customer#2026");

  assert.notEqual(hashedPassword, "Customer#2026");
  assert.equal(
    await verifyPassword("Customer#2026", hashedPassword),
    true,
  );
  assert.equal(await verifyPassword("wrong-password", hashedPassword), false);
});
