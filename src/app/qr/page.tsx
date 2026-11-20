import { headers } from "next/headers";
import QRCode from "qrcode";
import { QrActions } from "./actions";

export const metadata = { title: "Event QR code" };
export const dynamic = "force-dynamic";

export default async function QR({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const { to = "/build" } = await searchParams;
  const url = `${proto}://${host}${to.startsWith("/") ? to : "/build"}`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "H", color: { dark: "#0b0b0d", light: "#ffffff" } });
  const png = await QRCode.toDataURL(url, { margin: 2, width: 1200, errorCorrectionLevel: "H" });
  return (
    <div className="mx-auto max-w-md px-4 pt-28 text-center">
      <p className="font-tag text-xs text-red">For events & flyers</p>
      <h1 className="font-display mt-2 text-6xl font-black"><span className="chrome-text">Scan to build</span></h1>
      <div className="relative mx-auto mt-8 w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-[0_0_80px_-20px_#ff1f1f]">
        <div dangerouslySetInnerHTML={{ __html: svg }} className="[&>svg]:h-auto [&>svg]:w-full" />
        <img src="/icon.png" alt="" className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-black p-1.5 ring-4 ring-white" />
      </div>
      <p className="mt-4 break-all text-xs text-muted">{url}</p>
      <QrActions png={png} />
      <div className="mt-6 flex justify-center gap-2 text-xs">
        {[
          ["/build", "Builder"],
          ["/shop", "Shop"],
          ["/", "Home"],
          ["/imprint", "Imprint"],
        ].map(([p, l]) => (
          <a key={p} href={`/qr?to=${p}`} className={`rounded-full px-3 py-1.5 ring-1 ${to === p ? "bg-red ring-red" : "ring-white/15"}`}>{l}</a>
        ))}
      </div>
    </div>
  );
}
