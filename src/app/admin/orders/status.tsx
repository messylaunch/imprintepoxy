"use client";
import { useState } from "react";
import { api, useToast } from "@/components/providers";

const S = [["PAID", "Paid"], ["IN_PRODUCTION", "Pouring"], ["READY", "Ready"], ["SHIPPED", "Shipped"], ["DELIVERED", "Delivered"], ["CANCELLED", "Cancelled"]];
export function StatusSelect({ id, status }: { id: string; status: string }) {
  const [v, setV] = useState(status);
  const toast = useToast();
  return (
    <select className="input h-9 w-36 text-sm" value={v} onChange={async (e) => {
      setV(e.target.value);
      await api(`/api/admin/orders/${id}`, { status: e.target.value }, "PATCH");
      toast("Status updated");
    }}>
      {S.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
    </select>
  );
}
