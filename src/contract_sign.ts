import { InfraiClient } from "./infrai_client.ts";

export type ContractRequest = {
  tenantId: string;
  accountId: string;
  customerName: string;
  plan: string;
  approvedByAdmin: boolean;
};

export function approveContract(request: ContractRequest): boolean {
  return Boolean(request.tenantId && request.accountId && request.customerName && request.plan && request.approvedByAdmin);
}

export async function signContract(request: ContractRequest) {
  if (!approveContract(request)) throw new Error("Contract needs tenant, account, plan, customer, and admin approval");
  const client = new InfraiClient();
  const result = await client.generate({
    markdown: `# ${request.plan} agreement\n\nTenant: ${request.tenantId}\nAccount: ${request.accountId}\nCustomer: ${request.customerName}\nStatus: digitally signed by admin`,
    page_size: "A4",
    orientation: "portrait",
    store: true
  });
  return { tenantId: request.tenantId, accountId: request.accountId, status: "signed", document: result.data };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input: ContractRequest = {
    tenantId: process.env.DEMO_TENANT_ID ?? "tenant_media_42",
    accountId: process.env.DEMO_ACCOUNT_ID ?? "acct_1001",
    customerName: process.env.DEMO_CUSTOMER ?? "Northstar Studio",
    plan: process.env.DEMO_PLAN ?? "Creator Pro",
    approvedByAdmin: true
  };
  signContract(input).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
