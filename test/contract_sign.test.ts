import { strict as assert } from "node:assert";
import { approveContract } from "../src/contract_sign.ts";

const base = { tenantId: "tenant_1", accountId: "acct_1", customerName: "Studio", plan: "Starter", approvedByAdmin: true };
assert.equal(approveContract(base), true);
assert.equal(approveContract({ ...base, approvedByAdmin: false }), false);
assert.equal(approveContract({ ...base, tenantId: "" }), false);
console.log("contract approval decisions pass");
