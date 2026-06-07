import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  // Sicherstellen, dass die eingebetteten PDF-Schriften im Serverless-Bundle landen
  outputFileTracingIncludes: {
    '/api/bewertung': ['./public/fonts/**'],
    '/api/send-pdf': ['./public/fonts/**'],
  },
};

export default nextConfig;
