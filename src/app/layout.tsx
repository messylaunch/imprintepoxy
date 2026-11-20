import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geist";
import "@fontsource/instrument-serif/400-italic";
import "@fontsource/instrument-serif/400";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Nav, Footer, ImpersonationBanner } from "@/components/nav";
import { ChatBubble } from "@/components/chat-bubble";
import { getSession, publicUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Imprint Epoxy Design: Custom Tables, Helmet Displays & Wall Art", template: "%s · Imprint Epoxy" },
  description: "Upload your image, drag it into place, pick your pour. Custom epoxy tables, helmet displays and wall art, supported by Imprint.",
  icons: { icon: "/icon.png", apple: "/icon.png" },
};
export const viewport: Viewport = { themeColor: "#08080a", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  return (
    <html lang="en">
      <body>
        <Providers user={publicUser(s?.user ?? null)}>
          <Nav />
          {s?.impersonating && <ImpersonationBanner name={s.user.name} />}
          <main className="min-h-dvh">{children}</main>
          <Footer />
          <ChatBubble />
        </Providers>
      </body>
    </html>
  );
}
