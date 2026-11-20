import { Plus } from "lucide-react";

// Timelines and care notes are placeholders. Confirm with the studio before launch.
const QA: [string, string][] = [
  ["How does ordering work?", "Pick a piece, upload your photo, drag it into place and choose your finish. Check out, and we review every design before we pour. If anything needs adjusting (cropping, image quality, colors) we message you first."],
  ["How long does it take?", "Most custom pieces take about 2–3 weeks. Epoxy needs several days to cure properly. Finished pieces in the shop are ready now."],
  ["What kind of photo works best?", "The sharpest, largest version you have. Photos straight from a phone camera are usually great. Screenshots and photos from social media can look soft when printed this big. We'll tell you if yours will."],
  ["Can I change my design after ordering?", "Yes, until we start the pour. Open your project and tap “Ask about this” to message us about it directly."],
  ["What do overlays and flake do?", "Overlays (sparkles, galaxy, gold leaf and more) are printed into your design. Flake is real metallic glitter mixed into the pour, so it catches light for real."],
  ["How do I care for it?", "Wipe with a soft damp cloth. Use coasters for hot dishes and drinks, and skip harsh cleaners. Keep pieces out of long, direct sunlight."],
  ["Do you ship?", "Yes. Choose local pickup (free) or shipping at checkout. Tables are crated and insured."],
];

export function Faq() {
  return (
    <div className="divide-y divide-line border-y border-line">
      {QA.map(([q, a]) => (
        <details key={q} className="faq group">
          <summary className="flex items-center justify-between gap-6 py-5 text-left">
            <span className="text-[1.02rem] font-medium">{q}</span>
            <Plus size={18} className="faq-icon shrink-0 text-muted" />
          </summary>
          <p className="-mt-1 max-w-2xl pb-6 leading-relaxed text-muted">{a}</p>
        </details>
      ))}
    </div>
  );
}
