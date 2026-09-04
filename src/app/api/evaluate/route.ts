import { NextResponse } from "next/server";

const webhookUrl = process.env.N8N_WEBHOOK_URL ?? "https://xirenzit.app.n8n.cloud/webhook/cv-analysis";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const response = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...payload, source: "kanso-candidate-evaluation" }), cache: "no-store" });
    const text = await response.text();
    let data: unknown = text;
    try { data = JSON.parse(text); } catch { /* n8n may return plain text */ }
    if (!response.ok) return NextResponse.json({ error: "Webhook returned an error", detail: data }, { status: response.status });
    return NextResponse.json(data);
  } catch { return NextResponse.json({ error: "Unable to reach evaluation workflow" }, { status: 502 }); }
}
