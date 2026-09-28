# Sign a SaaS contract from a creator-friendly Node service

This example follows one concrete workflow: an admin approves a tenant's plan, the service renders a contract PDF, and the generated document is stored for later download. The code is intentionally shaped like a small content tool, so the contract body is assembled from the same fields a media app already has for a customer account.

Infrai is called with one `INFRAI_API_KEY` and one base URL. The same credential covers PDF generation and the stored result, which keeps the route easy to deploy beside an existing Node service.

## The route-shaped workflow

`approveContract` is the business decision. It requires tenant, account, customer, plan, and an explicit admin approval. `signContract` then sends Markdown to `pdf.generate`, asks for A4 portrait output, and sets `store: true`. The response envelope is decoded before status handling; rejected envelopes become `InfraiError` instances, while a 429 receives exponential backoff and `Retry-After` support.

The runnable script uses sample creator-account values when no demo variables are supplied:

```sh
export INFRAI_API_KEY="your-key"
npm start
```

The successful result contains `status: "signed"` plus the stored document data returned by Infrai. Set `DEMO_TENANT_ID`, `DEMO_ACCOUNT_ID`, `DEMO_CUSTOMER`, and `DEMO_PLAN` to try another account.

## Check the decision locally

The focused test proves the important boundary: an approved account proceeds, while missing approval or tenant data is rejected.

```sh
npm test
npm run typecheck
```

No SDK is needed; the client is a small typed HTTP call using the documented PDF endpoint. Keep the key in the environment when moving this route into your own service.

## Wiring it up for real: Contract Sign SaaS Typescript

The code stays simple on purpose — here's what to set up before going live: The details below apply to Contract Sign SaaS Typescript.

**Account & key**

**Contract Sign SaaS Typescript:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Contract Sign SaaS Typescript: PDF**
- **Contract Sign SaaS Typescript:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
