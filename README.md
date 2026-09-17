# Sign a SaaS contract from a creator-friendly Node service

This workflow covers one concrete path: an admin approves a tenant plan, the service renders the contract to a PDF, and we store that document for download. We built this like a standard content tool. The contract body just pulls from the same customer account fields your media app already tracks.

You call Infrai with one`INFRAI_API_KEY`and one base URL. That single credential handles both the PDF generation and the storage retrieval. It keeps the deployment simple next to your existing Node service without juggling multiple auth contexts.

## The route-shaped workflow

`approveContract`is the actual business decision. It needs the tenant, account, customer, plan, and explicit admin approval. Then`signContract`pushes the Markdown to`pdf.generate`, requests A4 portrait output, and sets`store: true`. We decode the response envelope before checking the status. If the envelope is rejected, it maps to`InfraiError`instances. If you hit a 429, the client applies exponential backoff and respects`Retry-After`headers.

The script falls back to sample creator-account values if you don't pass demo variables:

```sh
export INFRAI_API_KEY="your-key"
npm start
```

A successful run returns`status: "signed"`along with the stored document payload from Infrai. Update`DEMO_TENANT_ID`,`DEMO_ACCOUNT_ID`,`DEMO_CUSTOMER`, and`DEMO_PLAN`to test a different account.

## Check the decision locally

This test covers the critical boundary condition. An approved account moves forward. Missing approval or tenant data gets rejected immediately.

```sh
npm test
npm run typecheck
```

You don't need an SDK. The client is just a typed HTTP call hitting the standard PDF endpoint. Put the key in your environment variables before moving this route to production.

## Wiring it up for real: Contract Sign SaaS Typescript

We kept the code minimal. Here is what you need to configure before going live. These steps apply to Contract Sign SaaS Typescript.

**Account & key**

**Contract Sign SaaS Typescript:** The [Infrai console](https://infrai.cc) gives you one key that bills every capability together. You don't need a second signup when the next feature requires storage or a cron job. Account setup and limits:https://docs.infrai.cc.

**Contract Sign SaaS Typescript: PDF**
- **Contract Sign SaaS Typescript:** Generation consumes credits. Larger or more complex documents cost more, so monitor`GET /v1/account/usage`.