# Kanso | Sistem Evaluasi Pelamar

Workspace evaluasi pelamar berbasis Next.js, TypeScript, dan proxy webhook n8n.

Login awal: `admin` / `admin`.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Set `N8N_WEBHOOK_URL` di `.env.local` bila URL workflow berubah. Login ini adalah gate aplikasi sederhana; untuk produksi, ganti dengan autentikasi database atau penyedia identitas.

## Deploy

Import this repository into Vercel and add `N8N_WEBHOOK_URL` under Project Settings > Environment Variables. Build command: `npm run build`.

Endpoint diproxy melalui `/api/evaluate` untuk menghindari CORS. Workflow n8n menerima JSON berikut:

- Data opsional: `name`, `email`, `experience`, `skills`, `notes`
- Posisi: `role` dan `posisiDilamar`
- CV: `cvFileName`, `cvMimeType`, `cvBase64`

Di n8n, decode `cvBase64` menjadi binary PDF sebelum node ekstraksi teks atau AI. Upload dibatasi 4 MB agar kompatibel dengan batas request serverless Vercel.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
