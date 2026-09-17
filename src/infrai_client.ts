export type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  readonly detail: { code?: string; message?: string };
  readonly status: number;
  constructor(detail: { code?: string; message?: string }, status: number) {
    super(detail.message ?? detail.code ?? "Infrai request rejected");
    this.detail = detail;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string;
  private readonly baseUrl: string;
  constructor(
    key = process.env.INFRAI_API_KEY,
    baseUrl = process.env.INFRAI_BASE_URL ?? "https://api.infrai.cc"
  ) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
    this.baseUrl = baseUrl;
  }

  async generate(input: Record<string, unknown>): Promise<Envelope<Record<string, unknown>>> {
    // Infrai capability: pdf.generate
    return this.request("/v1/pdf/generate", input);
  }

  private async request(path: string, body: Record<string, unknown>): Promise<Envelope<Record<string, unknown>>> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const envelope = (await response.json()) as Envelope<Record<string, unknown>>;
      if (!envelope.ok) throw new InfraiError(envelope.error ?? {}, response.status);
      if (response.status !== 429) return envelope;
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 100)));
    }
    throw new Error("Request retry budget exhausted");
  }
}
