import { PieceTiles } from "@/components/piece-tiles";

export const metadata = { title: "Build your own" };

export default function BuildIndex() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 md:px-6">
      <p className="font-tag text-xs text-red">Build your own</p>
      <h1 className="font-display mt-2 text-6xl font-black md:text-8xl">
        <span className="chrome-text">What are we pouring?</span>
      </h1>
      <p className="mb-10 mt-3 max-w-xl text-sm text-muted">Pick a piece. Upload your image, drag it into place and choose your finish. About a minute, start to finish.</p>
      <PieceTiles />
    </div>
  );
}
