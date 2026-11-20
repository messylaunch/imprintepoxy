import { PieceTiles } from "@/components/piece-tiles";
import { Faq } from "@/components/faq";

export const metadata = { title: "Design yours" };

export default function BuildIndex() {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-28 md:px-8">
      <h1 className="font-display text-5xl md:text-6xl">
        What are we
        <span className="font-serif"> pouring?</span>
      </h1>
      <p className="mb-10 mt-4 max-w-xl text-muted">Pick a piece. Upload your photo, drag it into place and choose your finish. It takes about a minute.</p>
      <PieceTiles />
      <div className="mt-24 grid gap-10 md:grid-cols-[1fr_2fr]">
        <h2 className="font-display text-3xl md:text-4xl">How the process works</h2>
        <Faq />
      </div>
    </div>
  );
}
