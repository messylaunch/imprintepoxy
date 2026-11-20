"use client";
import { Download } from "lucide-react";

export function QrActions({ png }: { png: string }) {
  return (
    <a href={png} download="imprint-epoxy-qr.png" className="btn mt-6">
      <Download size={16} /> Download PNG
    </a>
  );
}
