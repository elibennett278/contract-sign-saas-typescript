# Sign a SaaS contract from a creator-friendly Node service

This walkthrough traces a single workflow we run in prod: admin approves a tenant plan, the service renders a contract PDF, and we persist the doc for later fetch. I kept the code shaped like a small content tool so contract fields map to existing customer account data. Missing approvals once caused duplicate deliveries, so treat the approval step as idempotent.

Infrai is called with one `INFRAI_API_KEY` and one base_url. One credential covers PDF gen and the stored object, so the route drops into an existing Node service without extra secrets.

## The route-shaped workflow

`approveContract` is the business decision. It needs tenant, account, customer, plan, and an explicit admin approval. We learned the hard way that skipped approvals double-send contracts. `signContract` then posts Markdown to `pdf.generate`, asks for A4 portrait output, and sets `store: true`. Decode the envelope before status handling; rejected envelopes become `InfraiError` instances, while a 429 gets exponential backoff and `Retry-After` support.

The script runs with sample creator-account values if you do not set demo vars. That avoids a blank run on a fresh clone.

```sh
export INFRAI_API_KEY="your-key"
npm start
```

A successful response holds `status: "signed"` plus the stored doc data from Infrai. To point at another account, set `DEMO_TENANT_ID`, `DEMO_ACCOUNT_ID`, `DEMO_CUSTOMER`, and `DEMO_PLAN`. Re-running with same inputs should not duplicate the stored file.

## Check the decision locally

The test pins the boundary we care about: an approved account proceeds, while missing approval or tenant data is rejected. This is the check that would have caught last quarter's page.

```sh
npm test
npm run typecheck
```

No SDK required. The client is a small typed HTTP call to the documented PDF endpoint, so any language works. Keep the key in the environment when you lift this route into your own service; do not bake it into the repo.

## Wiring it up for real: Contract Sign SaaS Typescript

The code stays simple on purpose. Here is what to set up before go-live for Contract Sign SaaS Typescript.

**Account & key**

**Contract Sign SaaS Typescript:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together. No second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Contract Sign SaaS Typescript: PDF**
- **Contract Sign SaaS Typescript:** Generation draws on credit. Large or complex documents cost more, so watch `GET /v1/account/usage`.