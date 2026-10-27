import { NextResponse } from "next/server";

const webhookUrl = process.env.N8N_WEBHOOK_URL ?? "https://xirenzit.app.n8n.cloud/webhook-test/cv-analysis";
const maxUploadBytes = 4 * 1024 * 1024;
const maxRequestBytes = 4.5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length"));
    if (contentLength > maxRequestBytes) {
      return NextResponse.json({ error: "Total request exceeds the 4 MB upload limit" }, { status: 413 });
    }

    let payload: Record<string, unknown>;
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      const uploadedFiles = form.getAll("cvFiles");
      if (uploadedFiles.length === 0 || uploadedFiles.some((value) => !(value instanceof File))) {
        return NextResponse.json({ error: "Upload at least one PDF file" }, { status: 400 });
      }

      const files = uploadedFiles as File[];
      const totalSize = files.reduce((total, file) => total + file.size, 0);
      if (files.some((file) => !file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf"))) {
        return NextResponse.json({ error: "All uploaded files must be PDFs" }, { status: 400 });
      }
      if (files.some((file) => file.size === 0) || totalSize > maxUploadBytes) {
        return NextResponse.json({ error: "PDF files must not be empty and their total size must not exceed 4 MB" }, { status: 413 });
      }

      const cvFiles = await Promise.all(files.map(async (file) => ({
        cvFileName: file.name,
        cvMimeType: "application/pdf",
        cvBase64: Buffer.from(await file.arrayBuffer()).toString("base64"),
      })));
      payload = {
        posisiDilamar: String(form.get("posisiDilamar") ?? ""),
        notes: String(form.get("notes") ?? ""),
        cvFiles,
      };
      if (!payload.posisiDilamar) {
        return NextResponse.json({ error: "Select a position before evaluating PDFs" }, { status: 400 });
      }
      if (cvFiles.length === 1) Object.assign(payload, cvFiles[0]);
    } else {
      payload = await request.json();
    }
    const response = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...payload, source: "kanso-candidate-evaluation" }), cache: "no-store" });
    const text = await response.text();
    let data: unknown = text;
    try { data = JSON.parse(text); } catch { /* n8n may return plain text */ }
    if (!response.ok) return NextResponse.json({ error: "Webhook returned an error", detail: data }, { status: response.status });
    return NextResponse.json(data);
  } catch { return NextResponse.json({ error: "Unable to reach evaluation workflow" }, { status: 502 }); }
}
