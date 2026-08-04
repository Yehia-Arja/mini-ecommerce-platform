import assert from "node:assert/strict";
import test from "node:test";

import { hashPassword, verifyPassword } from "../password.js";

test("hashPassword and verifyPassword work together", async () => {
  const hashedPassword = await hashPassword("Customer@123");

  assert.notEqual(hashedPassword, "Customer@123");
  assert.equal(await verifyPassword("Customer@123", hashedPassword), true);
  assert.equal(await verifyPassword("wrong-password", hashedPassword), false);
});
