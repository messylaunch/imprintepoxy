// Placeholder shipping & tax rules. Shared by checkout UI and the order API.
export const TAX_RATE = 0.0925; // placeholder sales tax

export function shippingFor(items: { price: number; qty: number; kind: string; config?: { product: string } | null; slug?: string }[], method: "ship" | "pickup") {
  if (method === "pickup") return 0;
  return items.reduce((a, i) => {
    const isTable = i.config?.product === "table" || i.slug?.includes("table");
    return a + (isTable ? 15000 : 2500) * i.qty;
  }, 0);
}

export function quote(items: Parameters<typeof shippingFor>[0], method: "ship" | "pickup") {
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const shipping = shippingFor(items, method);
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}
